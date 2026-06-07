import pandas as pd
import requests
import streamlit as st

@st.cache_data(ttl=86400 * 7) # Cache for 7 days
def get_sp500_tickers():
    headers = {'User-Agent': 'Mozilla/5.0'}
    url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    html = requests.get(url, headers=headers).text
    df = pd.read_html(html)[0]
    # Some S&P 500 tickers on Wikipedia use '.' instead of '-' (e.g. BRK.B instead of BRK-B) for yfinance
    return [sym.replace('.', '-') for sym in df['Symbol'].tolist()]

@st.cache_data(ttl=86400 * 7)
def get_nasdaq100_tickers():
    headers = {'User-Agent': 'Mozilla/5.0'}
    url = 'https://en.wikipedia.org/wiki/Nasdaq-100'
    html = requests.get(url, headers=headers).text
    df = pd.read_html(html)[5] 
    return df['Ticker'].tolist()

@st.cache_data(ttl=86400 * 7)
def get_nifty50_tickers():
    headers = {'User-Agent': 'Mozilla/5.0'}
    url = 'https://en.wikipedia.org/wiki/NIFTY_50'
    html = requests.get(url, headers=headers).text
    df = pd.read_html(html)[1] 
    return [sym + ".NS" for sym in df['Symbol'].tolist()]

@st.cache_data(ttl=86400 * 7)
def get_nifty_next_50_tickers():
    headers = {'User-Agent': 'Mozilla/5.0'}
    url = 'https://en.wikipedia.org/wiki/NIFTY_Next_50'
    html = requests.get(url, headers=headers).text
    df = pd.read_html(html)[2] 
    return [sym + ".NS" for sym in df['Symbol'].tolist()]
