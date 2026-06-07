import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import time

@st.cache_data(ttl=86400) # Cache for 24 hours
def scan_index(index_name, tickers, max_growth_cap_pct, discount_rate_pct):
    cap = max_growth_cap_pct / 100.0
    
    # We will only scan the first 100 stocks of S&P500 to avoid a massive 15-minute wait, 
    # unless it's a smaller index like NASDAQ 100 or Nifty 50.
    if len(tickers) > 150:
        tickers = tickers[:150]
        
    data_list = []
    
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    total = len(tickers)
    for i, ticker_symbol in enumerate(tickers):
        progress_bar.progress((i + 1) / total)
        status_text.text(f"Scanning {index_name}... Fetching {ticker_symbol} ({i+1}/{total})")
        
        try:
            t = yf.Ticker(ticker_symbol)
            info = t.info
            
            stock_name = info.get('shortName', info.get('longName', ticker_symbol))
            current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
            if current_price <= 0: continue
            
            pe_ratio = info.get('trailingPE', info.get('forwardPE', 15))
            current_eps = info.get('trailingEps', info.get('forwardEps', 0))
            if current_eps <= 0:
                current_eps = current_price / pe_ratio if pe_ratio > 0 else 0
                
            # Quick Price CAGR 5y
            hist = t.history(period='6y')
            if hist.empty: continue
            
            hist.index = hist.index.tz_localize(None)
            today = pd.Timestamp.now().normalize()
            
            def get_price(years_ago):
                dt = today - pd.Timedelta(days=365 * years_ago)
                closest = hist.index[hist.index <= dt]
                if not closest.empty:
                    return hist.loc[closest[-1]]['Close']
                return 0
                
            p5 = get_price(5)
            price_cagr_5y = ((current_price / p5) ** (1/5) - 1) if p5 > 0 else 0
            
            # Fundamentals
            fin = t.financials
            net_income_cagr = 0
            if fin is not None and not fin.empty and 'Net Income' in fin.index:
                ni = fin.loc['Net Income'].dropna()
                if len(ni) >= 2:
                    old_ni = ni.iloc[-1]
                    new_ni = ni.iloc[0]
                    yrs = len(ni) - 1
                    if old_ni > 0 and new_ni > 0:
                        net_income_cagr = (new_ni / old_ni) ** (1/yrs) - 1
            
            # Simple avg PE estimate
            target_pe = pe_ratio
            if 'Basic EPS' in fin.index:
                eps_data = fin.loc['Basic EPS'].dropna()
                pes = []
                for date, val in eps_data.items():
                    if val > 0:
                        dt = pd.to_datetime(date).tz_localize(None)
                        year_start = dt - pd.Timedelta(days=365)
                        prices = hist.loc[year_start:dt]['Close']
                        if not prices.empty:
                            pes.append(prices.mean() / val)
                if pes:
                    target_pe = sum(pes) / len(pes)
                    
            # Growth rates
            rate_np = min(net_income_cagr if net_income_cagr > 0 else price_cagr_5y, cap)
            rate_eps = min(price_cagr_5y, cap) # Simplified
            rate_5y_base = rate_np if rate_np > 0 else rate_eps
            
            # Projections
            year_5_price = current_eps * ((1 + rate_5y_base) ** 5) * target_pe
            growth_pct = ((year_5_price / current_price) - 1) * 100 if current_price > 0 else 0
            
            # Classification
            if growth_pct >= 100:
                classification = "✅ Conservatively Double"
            elif growth_pct >= 20:
                classification = "🟡 May Have Potential"
            else:
                classification = "🔴 May Not Absolutely"
                
            data_list.append({
                'Ticker': ticker_symbol,
                'Name': stock_name,
                'Classification': classification,
                'Current Price': round(current_price, 2),
                'Projected 5Y Price': round(year_5_price, 2),
                'Projected Return (%)': round(growth_pct, 1),
                'Target P/E': round(target_pe, 2),
                'Current P/E': round(pe_ratio, 2)
            })
            
        except Exception as e:
            continue
            
    progress_bar.empty()
    status_text.empty()
    
    return pd.DataFrame(data_list)
