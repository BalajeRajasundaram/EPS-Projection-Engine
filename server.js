const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Yahoo Finance Integration ---
let yahooFinance;
let yahooAvailable = false;

try {
  yahooFinance = require('yahoo-finance2').default;
  yahooFinance.setGlobalConfig({ queue: { concurrency: 2, timeout: 15000 } });
  yahooAvailable = true;
  console.log('✅ Yahoo Finance API loaded successfully (live data active)');
} catch (e) {
  console.log('⚠️  Yahoo Finance API not available (' + e.message + '), using mock data fallback');
}

// --- API: Search tickers ---
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 1) return res.json([]);

  if (yahooAvailable) {
    try {
      const results = await yahooFinance.search(query, { newsCount: 0 });
      const quotes = (results.quotes || [])
        .filter(q => q.exchDisp === 'NASDAQ' || q.exchDisp === 'NYSE' || q.exchDisp === 'NYSE American' || q.exchange === 'NMS' || q.exchange === 'NYQ')
        .slice(0, 10)
        .map(q => ({
          ticker: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          exchange: q.exchDisp || q.exchange,
          type: q.quoteType
        }));
      return res.json(quotes);
    } catch (e) {
      console.error('Search error:', e.message);
    }
  }
  // Fallback: return empty (frontend will search local universe)
  res.json([]);
});

// --- API: Get full stock quote + financials ---
app.get('/api/stock/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  if (yahooAvailable) {
    try {
      const [quote, stats, profile] = await Promise.all([
        yahooFinance.quote(ticker).catch(() => null),
        yahooFinance.quoteSummary(ticker, {
          modules: [
            'defaultKeyStatistics', 'financialData', 'earningsTrend',
            'incomeStatementHistory', 'cashflowStatementHistory',
            'balanceSheetHistory', 'majorHoldersBreakdown',
            'institutionOwnership', 'insiderHolders', 'summaryProfile',
            'summaryDetail', 'price', 'earningsHistory'
          ]
        }).catch(() => null)
      ]);

      if (!quote && !stats) {
        return res.status(404).json({ error: 'Stock not found', useMock: true });
      }

      const sd = stats?.summaryDetail || {};
      const fd = stats?.financialData || {};
      const ks = stats?.defaultKeyStatistics || {};
      const sp = stats?.summaryProfile || {};
      const pr = stats?.price || {};
      const mh = stats?.majorHoldersBreakdown || {};
      const ih = stats?.institutionOwnership?.ownershipList || [];

      // Income statement history for growth calcs
      const incomeHist = stats?.incomeStatementHistory?.incomeStatementHistory || [];
      const cfHist = stats?.cashflowStatementHistory?.cashflowStatements || [];
      const bsHist = stats?.balanceSheetHistory?.balanceSheetStatements || [];

      // Calculate growth rates from historical data
      const revenueCAGR5Y = calcCAGR(incomeHist.map(i => i.totalRevenue), 5);
      const revenueCAGR3Y = calcCAGR(incomeHist.map(i => i.totalRevenue), 3);
      const fcfValues = cfHist.map(cf => {
        const opCF = cf.totalCashFromOperatingActivities || 0;
        const capex = Math.abs(cf.capitalExpenditures || 0);
        return opCF - capex;
      });
      const fcfCAGR5Y = calcCAGR(fcfValues, 5);
      const fcfCAGR3Y = calcCAGR(fcfValues, 3);

      // Piotroski F-Score
      const piotroski = calcPiotroski(incomeHist, cfHist, bsHist);

      // Altman Z-Score
      const altmanZ = calcAltman(bsHist[0], incomeHist[0], quote);

      // Analyst growth estimate
      const et = stats?.earningsTrend?.trend || [];
      const longTermGrowth = et.find(t => t.period === '+5y');
      const analystGrowthEst5Y = longTermGrowth?.growth || null;

      const result = {
        ticker,
        profile: {
          sector: sp.sector || 'Unknown',
          industry: sp.industry || 'Unknown',
          description: sp.longBusinessSummary || '',
          employees: sp.fullTimeEmployees || null,
          website: sp.website || ''
        },
        price: {
          current: quote?.regularMarketPrice || fd.currentPrice || 0,
          previousClose: quote?.regularMarketPreviousClose || sd.previousClose || 0,
          dayChange: quote?.regularMarketChange || 0,
          dayChangePercent: quote?.regularMarketChangePercent || 0,
          fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh || sd.fiftyTwoWeekHigh || 0,
          fiftyTwoWeekLow: quote?.fiftyTwoWeekLow || sd.fiftyTwoWeekLow || 0,
          marketCap: quote?.marketCap || sd.marketCap || 0,
          volume: quote?.regularMarketVolume || sd.volume || 0,
          avgVolume: quote?.averageDailyVolume3Month || sd.averageVolume || 0
        },
        valuation: {
          peRatioTTM: sd.trailingPE || quote?.trailingPE || null,
          peRatioForward: sd.forwardPE || quote?.forwardPE || null,
          pbRatio: ks.priceToBook || sd.priceToBook || null,
          psRatio: ks.priceToSalesTrailing12Months || null,
          evToEbitda: ks.enterpriseToEbitda || null,
          pegRatio: ks.pegRatio || null
        },
        profitability: {
          grossMargin: fd.grossMargins || null,
          operatingMargin: fd.operatingMargins || null,
          netMargin: fd.profitMargins || null,
          roe: fd.returnOnEquity || null,
          roa: fd.returnOnAssets || null,
          roic: null // Not directly from yahoo
        },
        financialStrength: {
          debtToEquity: fd.debtToEquity || null,
          currentRatio: fd.currentRatio || null,
          quickRatio: fd.quickRatio || null,
          interestCoverage: null,
          freeCashFlow: fd.freeCashflow || null,
          totalCash: fd.totalCash || null,
          totalDebt: fd.totalDebt || null
        },
        dividend: {
          yield: sd.dividendYield || null,
          payoutRatio: sd.payoutRatio || null,
          fiveYearGrowthRate: null
        },
        momentum: {
          rsi14: null, // Calculated on frontend from historical prices
          fiftyDaySMA: quote?.fiftyDayAverage || null,
          twoHundredDaySMA: quote?.twoHundredDayAverage || null
        },
        growth: {
          revenueCAGR3Y,
          revenueCAGR5Y,
          fcfCAGR3Y,
          fcfCAGR5Y,
          analystGrowthEst5Y: analystGrowthEst5Y ? analystGrowthEst5Y : null
        },
        ownership: {
          institutionalPercent: mh.institutionsPercentHeld || null,
          insiderPercent: mh.insidersPercentHeld || null,
          topHolders: ih.slice(0, 5).map(h => ({
            name: h.organization || 'Unknown',
            percent: h.pctHeld || 0
          }))
        },
        shares: {
          outstanding: ks.sharesOutstanding || quote?.sharesOutstanding || null,
          floatShares: ks.floatShares || null
        },
        scores: {
          piotroski,
          altmanZ
        }
      };

      return res.json(result);
    } catch (e) {
      console.error(`Error fetching ${ticker}:`, e.message);
      return res.status(500).json({ error: e.message, useMock: true });
    }
  }

  res.json({ error: 'Yahoo Finance unavailable', useMock: true });
});

// --- API: Get historical prices ---
app.get('/api/history/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const range = req.query.range || '1y'; // 1mo, 6mo, 1y, 5y

  const rangeMap = {
    '1mo': { period1: daysAgo(30) },
    '6mo': { period1: daysAgo(180) },
    '1y': { period1: daysAgo(365) },
    '5y': { period1: daysAgo(365 * 5) }
  };

  if (yahooAvailable) {
    try {
      const period = rangeMap[range] || rangeMap['1y'];
      const result = await yahooFinance.historical(ticker, {
        period1: period.period1,
        period2: new Date(),
        interval: range === '5y' ? '1wk' : '1d'
      });

      const prices = result.map(r => ({
        date: r.date.toISOString().split('T')[0],
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
        volume: r.volume
      }));

      return res.json(prices);
    } catch (e) {
      console.error(`History error for ${ticker}:`, e.message);
    }
  }

  res.json({ error: 'History unavailable', useMock: true });
});

// --- API: Market overview (indices) ---
app.get('/api/market', async (req, res) => {
  if (yahooAvailable) {
    try {
      const indices = ['^GSPC', '^IXIC', '^DJI', '^VIX', '^TNX'];
      const quotes = await Promise.all(
        indices.map(s => yahooFinance.quote(s).catch(() => null))
      );

      const result = {
        sp500: formatIndex(quotes[0], 'S&P 500'),
        nasdaq: formatIndex(quotes[1], 'NASDAQ'),
        dowJones: formatIndex(quotes[2], 'Dow Jones'),
        vix: formatIndex(quotes[3], 'VIX'),
        treasury10Y: formatIndex(quotes[4], '10Y Treasury')
      };

      return res.json(result);
    } catch (e) {
      console.error('Market error:', e.message);
    }
  }

  // Fallback
  res.json({
    sp500: { name: 'S&P 500', value: 5320.00, change: 12.50, changePercent: 0.24 },
    nasdaq: { name: 'NASDAQ', value: 16780.00, change: 45.30, changePercent: 0.27 },
    dowJones: { name: 'Dow Jones', value: 39200.00, change: -35.20, changePercent: -0.09 },
    vix: { name: 'VIX', value: 14.20, change: -0.80, changePercent: -5.33 },
    treasury10Y: { name: '10Y Treasury', value: 4.42, change: 0.03, changePercent: 0.68 }
  });
});

// --- Helper functions ---
function formatIndex(q, name) {
  if (!q) return { name, value: 0, change: 0, changePercent: 0 };
  return {
    name,
    value: q.regularMarketPrice || 0,
    change: q.regularMarketChange || 0,
    changePercent: q.regularMarketChangePercent || 0
  };
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function calcCAGR(values, years) {
  if (!values || values.length < 2) return null;
  const filtered = values.filter(v => v != null && v > 0);
  if (filtered.length < 2) return null;
  const n = Math.min(years, filtered.length - 1);
  const endVal = filtered[0]; // Most recent
  const startVal = filtered[n];
  if (!startVal || startVal <= 0) return null;
  return Math.pow(endVal / startVal, 1 / n) - 1;
}

function calcPiotroski(incomeHist, cfHist, bsHist) {
  try {
    if (!incomeHist.length || !cfHist.length || !bsHist.length) return null;

    let score = 0;
    const curr = { income: incomeHist[0], cf: cfHist[0], bs: bsHist[0] };
    const prev = {
      income: incomeHist[1] || incomeHist[0],
      cf: cfHist[1] || cfHist[0],
      bs: bsHist[1] || bsHist[0]
    };

    // 1. Positive Net Income
    if ((curr.income.netIncome || 0) > 0) score++;

    // 2. Positive Operating Cash Flow
    const currOCF = curr.cf.totalCashFromOperatingActivities || 0;
    if (currOCF > 0) score++;

    // 3. Rising ROA
    const currTA = curr.bs.totalAssets || 1;
    const prevTA = prev.bs.totalAssets || 1;
    const currROA = (curr.income.netIncome || 0) / currTA;
    const prevROA = (prev.income.netIncome || 0) / prevTA;
    if (currROA > prevROA) score++;

    // 4. Cash Flow > Net Income (Earnings quality)
    if (currOCF > (curr.income.netIncome || 0)) score++;

    // 5. Decreasing Long-Term Debt ratio
    const currDebtRatio = (curr.bs.longTermDebt || 0) / currTA;
    const prevDebtRatio = (prev.bs.longTermDebt || 0) / prevTA;
    if (currDebtRatio < prevDebtRatio) score++;

    // 6. Improving Current Ratio
    const currCR = (curr.bs.totalCurrentAssets || 0) / (curr.bs.totalCurrentLiabilities || 1);
    const prevCR = (prev.bs.totalCurrentAssets || 0) / (prev.bs.totalCurrentLiabilities || 1);
    if (currCR > prevCR) score++;

    // 7. No new share dilution
    const currShares = curr.bs.commonStock || curr.income.dilutedEPS ? 1 : 0;
    const prevShares = prev.bs.commonStock || prev.income.dilutedEPS ? 1 : 0;
    if (currShares <= prevShares) score++;

    // 8. Improving Gross Margin
    const currGM = (curr.income.grossProfit || 0) / (curr.income.totalRevenue || 1);
    const prevGM = (prev.income.grossProfit || 0) / (prev.income.totalRevenue || 1);
    if (currGM > prevGM) score++;

    // 9. Improving Asset Turnover
    const currAT = (curr.income.totalRevenue || 0) / currTA;
    const prevAT = (prev.income.totalRevenue || 0) / prevTA;
    if (currAT > prevAT) score++;

    return score;
  } catch (e) {
    return null;
  }
}

function calcAltman(bs, income, quote) {
  try {
    if (!bs || !income || !quote) return null;

    const TA = bs.totalAssets || 1;
    const WC = (bs.totalCurrentAssets || 0) - (bs.totalCurrentLiabilities || 0);
    const RE = bs.retainedEarnings || 0;
    const EBIT = income.ebit || income.operatingIncome || 0;
    const MVE = quote.marketCap || 0;
    const TL = (bs.totalLiab || bs.totalLiabilities) || 1;
    const S = income.totalRevenue || 0;

    const z = 1.2 * (WC / TA) + 1.4 * (RE / TA) + 3.3 * (EBIT / TA) + 0.6 * (MVE / TL) + 1.0 * (S / TA);
    return Math.round(z * 100) / 100;
  } catch (e) {
    return null;
  }
}

// --- Start server ---
app.listen(PORT, () => {
  console.log(`\n🚀 Stock Value Analyzer running at http://localhost:${PORT}\n`);
});
