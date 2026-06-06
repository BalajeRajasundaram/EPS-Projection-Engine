import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import io
import xlsxwriter

st.set_page_config(page_title="EPS Projection Engine", layout="wide")

st.title("📈 EPS Projection & Valuation Engine")
st.markdown("Fetch historical data, adjust parameters, and generate 10-year stock value projections to Excel.")

# --- Formulas Explanation ---
with st.expander("ℹ️ How Projections Are Calculated (Formulas)", expanded=False):
    st.markdown("""
    ### 1. P/E Calculation (How we get Average P/E)
    - **Current P/E:** Extracted directly from the market today.
    - **5-Year Avg P/E:** For each of the last 4-5 years, we calculate the average daily stock price leading up to that year's earnings release, and divide it by that year's Earnings Per Share (EPS). We then average those numbers together to find the stock's true 5-Year Historical Average P/E.

    ### 2. Projection Methodology
    We project the stock's future value based on historical earnings growth and the user-defined **Target P/E**. By default, we use the 5-Year Avg P/E as the Target P/E.
    
    1. **EPS Interpolation:**
       `Future EPS = Current EPS * (1 + Growth Rate) ^ Years`
       *We project EPS into the future using historical growth rates. Growth rates are calculated using **Total Net Income** (when available) instead of basic EPS. This perfectly immunizes the calculations against Stock Splits and Face Value changes.*
       
    2. **Price Projection (Base Case):**
       `Future Price = Future EPS * Target P/E`
       *This assumes the stock trades at your Target P/E in the future.*
       
    3. **Price Projection (Industry Case):**
       `Future Price = Future EPS * Industry P/E`
       *This assumes the stock's valuation eventually converges to the industry average P/E ratio.*
    """)

# Sidebar settings
st.sidebar.header("⚙️ Settings")
max_growth_cap = st.sidebar.slider("Maximum Growth Cap (%)", min_value=5.0, max_value=50.0, value=20.0, step=1.0)
discount_rate = st.sidebar.slider("Required Rate of Return (%)", min_value=5.0, max_value=25.0, value=12.0, step=1.0)
st.sidebar.markdown("*Used to discount the Year 5 projected price back to today to determine fair value.*")

st.sidebar.markdown("---")
st.sidebar.caption("© 2026 Balaje Rajasundaram. All rights reserved. **Strictly for Non-Commercial & Educational Use.**")
st.sidebar.caption("⚠️ **Disclaimer:** This tool is for educational and informational purposes only. It does not constitute financial advice or investment recommendations. All projections are strictly mathematical extrapolations based on historical data and do not guarantee future performance. Please consult a licensed financial advisor before making any investment decisions.")

st.header("1. Fetch Data")
tickers_input = st.text_input("Enter Stock Tickers (comma separated):", "AAPL, MSFT, RELIANCE.NS")

def get_cagr(start_val, end_val, years):
    if start_val <= 0 or end_val <= 0 or years <= 0:
        return 0
    return (end_val / start_val) ** (1 / years) - 1

def get_avg_pe(t, eps):
    try:
        hist = t.history(period='6y')
        if hist.empty: return None
        hist.index = hist.index.tz_localize(None)
        pes = []
        for date, val in eps.items():
            if val <= 0: continue
            dt = pd.to_datetime(date).tz_localize(None)
            year_start = dt - pd.Timedelta(days=365)
            prices = hist.loc[year_start:dt]['Close']
            if not prices.empty:
                pes.append(prices.mean() / val)
        return sum(pes)/len(pes) if pes else None
    except Exception:
        return None

def fetch_stock_data(tickers):
    data_list = []
    cap = max_growth_cap / 100.0
    
    for ticker_symbol in tickers:
        try:
            t = yf.Ticker(ticker_symbol)
            info = t.info
            
            # Current data
            current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
            pe_ratio = info.get('trailingPE', info.get('forwardPE', 15))
            current_eps = info.get('trailingEps', info.get('forwardEps', 0))
            
            if current_eps <= 0:
                current_eps = current_price / pe_ratio if pe_ratio > 0 else 0
                
            # Get historical price data as proxy for long-term growth (15 years)
            hist = t.history(period="15y")
            price_cagr_5y, price_cagr_10y, price_cagr_15y = 0, 0, 0
            if len(hist) > 0:
                current_hist_price = hist['Close'].iloc[-1]
                if len(hist) >= 252 * 5:
                    price_cagr_5y = get_cagr(hist['Close'].iloc[-252 * 5], current_hist_price, 5)
                if len(hist) >= 252 * 10:
                    price_cagr_10y = get_cagr(hist['Close'].iloc[-252 * 10], current_hist_price, 10)
                if len(hist) >= 252 * 14: # roughly 15 years
                    price_cagr_15y = get_cagr(hist['Close'].iloc[0], current_hist_price, 15)
                    
            # Financials for short term EPS growth and historical PE
            fin = t.financials
            net_income_cagr = 0
            raw_eps_cagr = 0
            avg_pe_5y = None
            
            if fin is not None and not fin.empty:
                # Use Net Income to calculate historical fundamental growth if possible (immune to splits/face value)
                if 'Net Income' in fin.index:
                    ni_history = fin.loc['Net Income'].dropna()
                    # Only calculate CAGR if both start and end are positive
                    if len(ni_history) >= 2 and ni_history.iloc[-1] > 0 and ni_history.iloc[0] > 0:
                        net_income_cagr = get_cagr(ni_history.iloc[-1], ni_history.iloc[0], len(ni_history) - 1)
                
                # Calculate Raw EPS Growth for reference
                if 'Diluted EPS' in fin.index:
                    eps_history = fin.loc['Diluted EPS'].dropna()
                    if len(eps_history) >= 2:
                        if eps_history.iloc[-1] > 0 and eps_history.iloc[0] > 0:
                            raw_eps_cagr = get_cagr(eps_history.iloc[-1], eps_history.iloc[0], len(eps_history) - 1)
                    # Calculate True 5-Year Historical Average PE
                    avg_pe_5y = get_avg_pe(t, eps_history)
            
            # Decide the base 5y rate (Prioritize Net Income -> EPS -> Price)
            rate_np = min(net_income_cagr if net_income_cagr > 0 else price_cagr_5y, cap)
            rate_eps = min(raw_eps_cagr if raw_eps_cagr > 0 else price_cagr_5y, cap)
            rate_5y_base = rate_np if rate_np > 0 else rate_eps
            
            rate_10y = min(price_cagr_10y if price_cagr_10y > 0 else rate_5y_base * 0.8, cap)
            rate_15y = min(price_cagr_15y if price_cagr_15y > 0 else rate_5y_base * 0.6, cap)
            
            target_pe = avg_pe_5y if avg_pe_5y else pe_ratio
            
            data_list.append({
                'Ticker': ticker_symbol,
                'Current Price': round(current_price, 2),
                'Current EPS': round(current_eps, 2),
                'Current P/E': round(pe_ratio, 2),
                '5-Year Avg P/E': round(avg_pe_5y, 2) if avg_pe_5y else round(pe_ratio, 2),
                'Target P/E': round(target_pe, 2),
                'Industry P/E': round(pe_ratio * 0.9, 2), # Default mock industry PE
                'Net Profit Growth (%)': round(rate_np * 100, 1),
                'Raw EPS Growth (%)': round(rate_eps * 100, 1),
                '10-Year Price Growth (%)': round(rate_10y * 100, 1),
                '15-Year Price Growth (%)': round(rate_15y * 100, 1)
            })
        except Exception as e:
            st.error(f"Error fetching {ticker_symbol}: {e}")
            
    return pd.DataFrame(data_list)

# Session state to hold fetched data
if 'raw_data' not in st.session_state:
    st.session_state.raw_data = None

if st.button("Fetch Data", type="primary", use_container_width=True):
    tickers = [t.strip().upper() for t in tickers_input.split(',') if t.strip()]
    if tickers:
        with st.spinner("Fetching historical data and calculating 5-Year Avg PE..."):
            st.session_state.raw_data = fetch_stock_data(tickers)
    else:
        st.warning("Please enter at least one ticker.")

if st.session_state.raw_data is not None and not st.session_state.raw_data.empty:
    st.header("2. Adjust Parameters")
    st.markdown("Review and adjust the extracted data below. The projections will use these exact values. **You can double-click any cell to edit it.** *(Table is transposed to fit perfectly on mobile screens)*")
    
    # Editable dataframe (Transposed for Mobile)
    df_for_editing = st.session_state.raw_data.set_index('Ticker').T
    edited_df_t = st.data_editor(df_for_editing, use_container_width=True)
    edited_df = edited_df_t.T.reset_index()
    
    st.header("3. Generate Projections")
    projection_length = st.radio("Projection Window", [5, 10], index=0, format_func=lambda x: f"{x} Years", horizontal=True)
    
    if st.button("Generate Excel Report"):
        with st.spinner(f"Generating {projection_length}-Year projections and charts..."):
            output = io.BytesIO()
            workbook = xlsxwriter.Workbook(output, {'in_memory': True})
            
            # Create formats
            header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'border': 1})
            money_format = workbook.add_format({'num_format': '#,##0.00'})
            
            for index, row in edited_df.iterrows():
                ticker = row['Ticker']
                current_price = row['Current Price']
                eps = row['Current EPS']
                stock_pe = row['Target P/E']
                ind_pe = row['Industry P/E']
                
                # Convert percentages back to decimals
                r_np = row['Net Profit Growth (%)'] / 100.0
                r_eps = row['Raw EPS Growth (%)'] / 100.0
                r10 = row['10-Year Price Growth (%)'] / 100.0
                r15 = row['15-Year Price Growth (%)'] / 100.0
                
                scenarios = {
                    f"5Y Net Profit Trend ({r_np*100:.1f}%)": r_np,
                    f"5Y Raw EPS Trend ({r_eps*100:.1f}%)": r_eps,
                    f"10Y Price Trend ({r10*100:.1f}%)": r10,
                    f"15Y Price Trend ({r15*100:.1f}%)": r15
                }
                
                worksheet = workbook.add_worksheet(ticker[:31])
                
                worksheet.write('A1', f"Projections for {ticker}", workbook.add_format({'bold': True, 'size': 14}))
                worksheet.write('A2', f"Base Data -> EPS: {eps} | Target P/E: {stock_pe} | Industry P/E: {ind_pe}")
                worksheet.write('A3', f"Formula: Future Price = Future EPS * P/E Multiple")
                
                # Headers
                worksheet.write('A5', 'Year', header_format)
                col = 1
                for sc_name in scenarios.keys():
                    worksheet.write(4, col, f"EPS ({sc_name})", header_format)
                    worksheet.write(4, col+1, f"Price via Target P/E", header_format)
                    worksheet.write(4, col+2, f"Price via Industry P/E", header_format)
                    col += 3
                    
                # Projections Calculation
                current_year = pd.Timestamp.now().year
                real_years = list(range(current_year + 1, current_year + projection_length + 1))
                plot_data = {}
                
                for i, r_year in enumerate(real_years):
                    year_idx = i + 1
                    worksheet.write(i + 5, 0, str(r_year))
                    col = 1
                    for sc_name, rate in scenarios.items():
                        proj_eps = eps * ((1 + rate) ** year_idx)
                        proj_price_stock = proj_eps * stock_pe
                        proj_price_ind = proj_eps * ind_pe
                        
                        worksheet.write(i + 5, col, proj_eps, money_format)
                        worksheet.write(i + 5, col+1, proj_price_stock, money_format)
                        worksheet.write(i + 5, col+2, proj_price_ind, money_format)
                        
                        if sc_name not in plot_data:
                            plot_data[sc_name] = []
                        plot_data[sc_name].append(proj_price_stock)
                        
                        col += 3
                        
                # Plotting Target PE and Industry PE side-by-side
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
                
                # Plot 1: Target PE
                for sc_name, prices in plot_data.items():
                    ax1.plot(real_years, prices, marker='o', label=sc_name)
                ax1.set_title(f"{projection_length}-Year Price Projection (Target P/E: {stock_pe})")
                ax1.set_xlabel("Year")
                ax1.set_ylabel("Projected Price")
                ax1.grid(True, alpha=0.3)
                ax1.legend()
                
                # Plot 2: Industry PE
                for sc_name, rate in scenarios.items():
                    ind_prices = [eps * ((1 + rate) ** y) * ind_pe for y in range(1, projection_length + 1)]
                    ax2.plot(real_years, ind_prices, marker='o', linestyle='--', label=sc_name)
                ax2.set_title(f"{projection_length}-Year Price Projection (Industry P/E: {ind_pe})")
                ax2.set_xlabel("Year")
                ax2.set_ylabel("Projected Price")
                ax2.grid(True, alpha=0.3)
                ax2.legend()
                
                fig.tight_layout()
                
                img_data = io.BytesIO()
                fig.savefig(img_data, format='png', bbox_inches='tight')
                img_data.seek(0)
                
                worksheet.insert_image('A17', f"{ticker}_plot.png", {'image_data': img_data, 'x_scale': 0.8, 'y_scale': 0.8})
                plt.close(fig)
                
            workbook.close()
            output.seek(0)
            
            st.success("Excel generation complete!")
            st.download_button(
                label="📥 Download Projections (Excel)",
                data=output,
                file_name="EPS_Projections_Advanced.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            
            st.markdown("---")
            st.header("📊 Projection Previews")
            
            for index, row in edited_df.iterrows():
                ticker = row['Ticker']
                stock_pe = row['Target P/E']
                ind_pe = row['Industry P/E']
                eps = row['Current EPS']
                
                r_np = row['Net Profit Growth (%)'] / 100.0
                r_eps = row['Raw EPS Growth (%)'] / 100.0
                r10 = row['10-Year Price Growth (%)'] / 100.0
                r15 = row['15-Year Price Growth (%)'] / 100.0
                
                st.subheader(f"{ticker} Projections")
                
                # Check 5-Year Growth (Scenario 1) based on Net Profit
                year_5_price = eps * ((1 + r_np) ** 5) * stock_pe
                current_price = row['Current Price']
                growth_pct = ((year_5_price / current_price) - 1) * 100 if current_price > 0 else 0
                
                # Fair Value Calculation (Discounting Year 5 back to today)
                discounted_fair_value = year_5_price / ((1 + (discount_rate / 100.0)) ** 5)
                margin_of_safety = ((discounted_fair_value / current_price) - 1) * 100 if current_price > 0 else 0
                
                if margin_of_safety > 10:
                    val_status = "🟢 Undervalued"
                elif margin_of_safety < -10:
                    val_status = "🔴 Overvalued"
                else:
                    val_status = "🟡 Fairly Valued"
                
                doubles_text = "✅ Yes (Grows >100%)" if growth_pct >= 100 else "❌ No"
                st.markdown(f"**Current Price:** ${current_price:.2f} | **Projected Year 5 Price (via Net Profit & Past Avg P/E):** ${year_5_price:.2f}")
                st.markdown(f"**5-Year Return:** {growth_pct:.1f}% | **Will it double?** {doubles_text}")
                st.markdown(f"**Intrinsic Fair Value Today (assuming {discount_rate}% required return):** ${discounted_fair_value:.2f} ({val_status})")
                
                # Preview Plot side-by-side using Plotly
                current_year = pd.Timestamp.now().year
                real_years = list(range(current_year + 1, current_year + projection_length + 1))
                
                scenarios = {
                    f"5Y Net Profit Trend ({r_np*100:.1f}%)": r_np,
                    f"5Y Raw EPS Trend ({r_eps*100:.1f}%)": r_eps,
                    f"10Y Price Trend ({r10*100:.1f}%)": r10,
                    f"15Y Price Trend ({r15*100:.1f}%)": r15
                }
                
                col1, col2 = st.columns(2)
                
                # Plot 1: Target PE
                fig1 = go.Figure()
                for sc_name, rate in scenarios.items():
                    prices = [eps * ((1 + rate) ** y) * stock_pe for y in range(1, projection_length + 1)]
                    fig1.add_trace(go.Scatter(x=real_years, y=prices, mode='lines+markers', name=sc_name))
                fig1.update_layout(
                    title=f"{projection_length}-Year Projection via Target P/E ({stock_pe})", 
                    xaxis_title="Year", 
                    yaxis_title="Projected Price ($)", 
                    margin=dict(l=20, r=20, t=50, b=20),
                    legend=dict(orientation="h", yanchor="top", y=-0.2, xanchor="center", x=0.5)
                )
                
                with col1:
                    st.plotly_chart(fig1, use_container_width=True, config={'displayModeBar': False})
                
                # Plot 2: Industry PE
                fig2 = go.Figure()
                for sc_name, rate in scenarios.items():
                    ind_prices = [eps * ((1 + rate) ** y) * ind_pe for y in range(1, projection_length + 1)]
                    line_dash = 'dash' if 'Trend' in sc_name else 'solid'
                    fig2.add_trace(go.Scatter(x=real_years, y=ind_prices, mode='lines+markers', name=sc_name, line=dict(dash=line_dash)))
                fig2.update_layout(
                    title=f"{projection_length}-Year Projection via Industry P/E ({ind_pe})", 
                    xaxis_title="Year", 
                    yaxis_title="Projected Price ($)", 
                    margin=dict(l=20, r=20, t=50, b=20),
                    legend=dict(orientation="h", yanchor="top", y=-0.2, xanchor="center", x=0.5)
                )
                
                with col2:
                    st.plotly_chart(fig2, use_container_width=True, config={'displayModeBar': False})
