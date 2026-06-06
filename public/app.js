// ============================================================
// ValueScope — Frontend Application Engine
// ============================================================

(function () {
  'use strict';

  // ─── State ──────────────────────────────────────────────
  const STATE = {
    currentView: 'dashboard',
    currentStock: null,
    stockData: null,
    historyData: null,
    screener: { page: 1, perPage: 25, sort: 'ticker', sortDir: 1, filters: {} },
    baskets: JSON.parse(localStorage.getItem('vs_baskets') || '{}'),
    activeBasket: localStorage.getItem('vs_activeBasket') || '',
    charts: {}
  };

  // ─── Helpers ────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const fmt = (n, d = 2) => n != null ? Number(n).toFixed(d) : '—';
  const fmtPct = n => n != null ? (n * 100).toFixed(2) + '%' : '—';
  const fmtB = n => { if (n == null) return '—'; const a = Math.abs(n); if (a >= 1e12) return (n/1e12).toFixed(2)+'T'; if (a >= 1e9) return (n/1e9).toFixed(2)+'B'; if (a >= 1e6) return (n/1e6).toFixed(2)+'M'; if (a >= 1e3) return (n/1e3).toFixed(1)+'K'; return fmt(n); };
  const fmtMC = n => fmtB(n);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function getAITier(ticker) {
    const s = window.STOCK_UNIVERSE.find(x => x.ticker === ticker);
    return s ? s.aiTier : 4;
  }

  function getSector(ticker) {
    const s = window.STOCK_UNIVERSE.find(x => x.ticker === ticker);
    return s ? s.sector : 'Unknown';
  }

  function getSuitability(sector) {
    return window.SECTOR_SUITABILITY[sector] || window.SECTOR_SUITABILITY['Technology'];
  }

  // ─── Navigation ─────────────────────────────────────────
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.view));
  });

  function navigateTo(view, stockTicker) {
    STATE.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    $('view-' + view).classList.add('active');
    const nav = $('nav-' + view);
    if (nav) nav.classList.add('active');

    if (view === 'dashboard') renderDashboard();
    if (view === 'screener') renderScreener();
    if (view === 'analysis' && stockTicker) loadStock(stockTicker);
    if (view === 'research') renderResearchHub();
    if (view === 'basket') renderBasket();
  }

  // ─── Search ─────────────────────────────────────────────
  const searchInput = $('search-global');
  const searchResults = $('search-results-global');
  let searchTimeout;

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length < 1) { searchResults.classList.remove('visible'); return; }
    searchTimeout = setTimeout(() => performSearch(q), 200);
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim().toUpperCase();
      if (q) { searchResults.classList.remove('visible'); navigateTo('analysis', q); searchInput.value = ''; }
    }
  });

  document.addEventListener('click', e => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('visible');
    }
  });

  async function performSearch(q) {
    const upper = q.toUpperCase();
    // Local universe search
    const local = window.STOCK_UNIVERSE.filter(s =>
      s.ticker.includes(upper) || s.name.toUpperCase().includes(upper)
    ).slice(0, 8);

    // Try API search too
    let remote = [];
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(q));
      if (res.ok) remote = await res.json();
    } catch (e) { /* ignore */ }

    // Merge, preferring remote but filling with local
    const seen = new Set();
    const merged = [];
    for (const r of remote) { seen.add(r.ticker); merged.push(r); }
    for (const l of local) { if (!seen.has(l.ticker)) merged.push({ ticker: l.ticker, name: l.name }); }

    renderSearchResults(merged.slice(0, 10));
  }

  function renderSearchResults(results) {
    if (!results.length) { searchResults.classList.remove('visible'); return; }
    searchResults.innerHTML = results.map(r => `
      <div class="search-result-item" data-ticker="${r.ticker}">
        <div><span class="search-result-ticker">${r.ticker}</span><span class="search-result-name">${r.name || ''}</span></div>
      </div>
    `).join('');
    searchResults.classList.add('visible');
    searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        searchResults.classList.remove('visible');
        searchInput.value = '';
        navigateTo('analysis', el.dataset.ticker);
      });
    });
  }

  // ─── Screener Search ───────────────────────────────────
  const screenerSearch = $('screener-search');
  if (screenerSearch) {
    screenerSearch.addEventListener('input', () => { STATE.screener.page = 1; renderScreener(); });
  }

  // ─── Dashboard ──────────────────────────────────────────
  async function renderDashboard() {
    renderMarketIndices();
    renderMacroCards();
    renderTopValuePicks();
    renderSectorPicks();
  }

  async function renderMarketIndices() {
    const container = $('market-indices');
    let data;
    try {
      const res = await fetch('/api/market');
      data = await res.json();
    } catch (e) {
      data = {
        sp500: { name: 'S&P 500', value: 5320, change: 12.5, changePercent: 0.24 },
        nasdaq: { name: 'NASDAQ', value: 16780, change: 45.3, changePercent: 0.27 },
        dowJones: { name: 'Dow Jones', value: 39200, change: -35.2, changePercent: -0.09 },
        vix: { name: 'VIX', value: 14.2, change: -0.8, changePercent: -5.33 },
        treasury10Y: { name: '10Y Treasury', value: 4.42, change: 0.03, changePercent: 0.68 }
      };
    }

    container.innerHTML = Object.values(data).map(idx => {
      const pos = idx.change >= 0;
      return `<div class="index-card">
        <div class="index-name">${idx.name}</div>
        <div class="index-value">${idx.name === 'VIX' || idx.name === '10Y Treasury' ? fmt(idx.value, 2) : fmtB(idx.value)}</div>
        <div class="index-change ${pos ? 'change-positive' : 'change-negative'}">
          ${pos ? '▲' : '▼'} ${fmt(Math.abs(idx.change))} (${fmt(Math.abs(idx.changePercent))}%)
        </div>
      </div>`;
    }).join('');
  }

  function renderMacroCards() {
    const container = $('macro-cards');
    container.innerHTML = `
      <div class="card">
        <div class="card-header"><span class="card-title">📊 Market Regime</span></div>
        <p style="color:var(--accent-emerald);font-weight:700;font-size:1.1rem">Bullish</p>
        <p class="metric-sub mt-8">S&P 500 is trading above its 200-day SMA, indicating an uptrend environment. Favor growth and quality stocks.</p>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">💰 Interest Rate Impact</span></div>
        <p style="color:var(--accent-amber);font-weight:700;font-size:1.1rem">Elevated Rates (4.4%)</p>
        <p class="metric-sub mt-8">Higher discount rates compress valuations for long-duration assets (growth/tech). Favor companies with strong near-term cash flows.</p>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🔄 Sector Rotation</span></div>
        <p style="color:var(--accent-teal);font-weight:700;font-size:1.1rem">Technology & AI Leading</p>
        <p class="metric-sub mt-8">AI infrastructure spend is driving Technology and Semiconductor outperformance. Defensive sectors (Utilities, Staples) lagging.</p>
      </div>
    `;
  }

  function renderTopValuePicks() {
    const container = $('top-value-picks');
    const picks = window.STOCK_UNIVERSE
      .filter(s => window.MOCK_DATA[s.ticker])
      .map(s => {
        const d = window.MOCK_DATA[s.ticker];
        const suit = getSuitability(s.sector);
        const score = calcValueScore(d, s.sector, s.aiTier);
        return { ...s, data: d, score, suitability: suit };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    container.innerHTML = `<div class="table-container"><table class="data-table">
      <thead><tr><th>Ticker</th><th>Company</th><th>Sector</th><th>Price</th><th>P/E</th><th>AI Tier</th><th>Value Score</th><th>Rating</th></tr></thead>
      <tbody>${picks.map(p => {
        const badge = getScoreBadge(p.score);
        const tierCfg = window.AI_TIER_CONFIG[p.aiTier];
        return `<tr style="cursor:pointer" onclick="window._navStock('${p.ticker}')">
          <td style="color:var(--accent-teal);font-weight:700">${p.ticker}</td>
          <td>${p.name}</td><td>${p.sector}</td>
          <td>$${fmt(p.data.price.current)}</td>
          <td>${fmt(p.data.valuation.peRatioTTM, 1)}</td>
          <td><span class="badge badge-ai-tier${p.aiTier}" style="font-size:0.65rem">${tierCfg.tierName.split(' ')[0]} ${tierCfg.tierName.split(' ')[1] || ''}</span></td>
          <td style="font-weight:700;color:${badge.color}">${p.score}</td>
          <td><span class="badge ${badge.cls}">${badge.label}</span></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
  }

  function renderSectorPicks() {
    const container = $('sector-picks');
    const sectors = [...new Set(window.STOCK_UNIVERSE.map(s => s.sector))];
    const cards = sectors.map(sec => {
      const best = window.STOCK_UNIVERSE
        .filter(s => s.sector === sec && window.MOCK_DATA[s.ticker])
        .map(s => ({ ...s, score: calcValueScore(window.MOCK_DATA[s.ticker], s.sector, s.aiTier) }))
        .sort((a, b) => b.score - a.score)[0];
      if (!best) return '';
      const badge = getScoreBadge(best.score);
      return `<div class="card" style="cursor:pointer" onclick="window._navStock('${best.ticker}')">
        <div class="card-header"><span class="card-title">${sec}</span></div>
        <div class="flex items-center gap-12">
          <span style="color:var(--accent-teal);font-weight:700;font-size:1.1rem">${best.ticker}</span>
          <span class="badge ${badge.cls}">${badge.label}: ${best.score}</span>
        </div>
        <p class="metric-sub mt-8">${best.name}</p>
      </div>`;
    }).filter(Boolean);
    container.innerHTML = cards.join('');
  }

  window._navStock = ticker => navigateTo('analysis', ticker);

  // ─── Screener ───────────────────────────────────────────
  function renderScreener() {
    const filterSector = $('filter-sector');
    const filterCap = $('filter-cap');
    const filterAI = $('filter-ai');

    [filterSector, filterCap, filterAI].forEach(el => {
      el.onchange = () => { STATE.screener.page = 1; renderScreener(); };
    });

    let stocks = [...window.STOCK_UNIVERSE];

    // Apply filters
    const sVal = filterSector.value;
    const cVal = filterCap.value;
    const aVal = filterAI.value;
    const searchVal = ($('screener-search')?.value || '').toUpperCase().trim();

    if (sVal) stocks = stocks.filter(s => s.sector === sVal);
    if (cVal) stocks = stocks.filter(s => s.marketCapTier === cVal);
    if (aVal) stocks = stocks.filter(s => s.aiTier === parseInt(aVal));
    if (searchVal) stocks = stocks.filter(s => s.ticker.includes(searchVal) || s.name.toUpperCase().includes(searchVal));

    // Sort
    const { sort, sortDir } = STATE.screener;
    stocks.sort((a, b) => {
      const av = a[sort] || '', bv = b[sort] || '';
      if (typeof av === 'string') return av.localeCompare(bv) * sortDir;
      return (av - bv) * sortDir;
    });

    // Pagination
    const total = stocks.length;
    const pages = Math.ceil(total / STATE.screener.perPage);
    const page = clamp(STATE.screener.page, 1, pages || 1);
    const start = (page - 1) * STATE.screener.perPage;
    const pageStocks = stocks.slice(start, start + STATE.screener.perPage);

    // Render table body
    const tbody = $('screener-body');
    tbody.innerHTML = pageStocks.map(s => {
      const tierCfg = window.AI_TIER_CONFIG[s.aiTier];
      return `<tr onclick="window._navStock('${s.ticker}')">
        <td style="color:var(--accent-teal);font-weight:700">${s.ticker}</td>
        <td class="truncate" style="max-width:200px">${s.name}</td>
        <td>${s.sector}</td>
        <td>${s.marketCapTier}</td>
        <td><span class="badge badge-ai-tier${s.aiTier}" style="font-size:0.62rem">${tierCfg.tierName.split('—')[0].trim().split('/')[0].trim()}</span></td>
      </tr>`;
    }).join('');

    // Sort headers
    $('screener-table').querySelectorAll('th[data-sort]').forEach(th => {
      th.onclick = () => {
        const col = th.dataset.sort;
        if (STATE.screener.sort === col) STATE.screener.sortDir *= -1;
        else { STATE.screener.sort = col; STATE.screener.sortDir = 1; }
        renderScreener();
      };
    });

    // Pagination
    const pagEl = $('screener-pagination');
    let pagHTML = `<span class="page-info">Showing ${start + 1}–${Math.min(start + STATE.screener.perPage, total)} of ${total}</span>`;
    pagHTML += `<button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="window._scrPage(${page - 1})">‹ Prev</button>`;
    const maxBtns = 7;
    let pStart = Math.max(1, page - 3), pEnd = Math.min(pages, pStart + maxBtns - 1);
    if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
    for (let i = pStart; i <= pEnd; i++) {
      pagHTML += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="window._scrPage(${i})">${i}</button>`;
    }
    pagHTML += `<button class="page-btn" ${page >= pages ? 'disabled' : ''} onclick="window._scrPage(${page + 1})">Next ›</button>`;
    pagEl.innerHTML = pagHTML;
  }
  window._scrPage = p => { STATE.screener.page = p; renderScreener(); };

  // ─── Stock Analysis ─────────────────────────────────────
  async function loadStock(ticker) {
    $('analysis-empty').classList.add('hidden');
    $('analysis-content').classList.add('hidden');
    $('analysis-loading').classList.remove('hidden');

    STATE.currentStock = ticker;
    let data = null;

    // Try API first
    try {
      const res = await fetch('/api/stock/' + ticker);
      const json = await res.json();
      if (!json.error && !json.useMock) data = json;
    } catch (e) { /* fallback */ }

    // Fallback to mock data
    if (!data && window.MOCK_DATA[ticker]) {
      const mock = window.MOCK_DATA[ticker];
      data = {
        ticker,
        ...mock,
        scores: {
          piotroski: calcMockPiotroski(mock),
          altmanZ: calcMockAltman(mock)
        }
      };
    }

    if (!data) {
      $('analysis-loading').classList.add('hidden');
      $('analysis-empty').classList.remove('hidden');
      $('analysis-empty').querySelector('.empty-title').textContent = `No data found for ${ticker}`;
      $('analysis-empty').querySelector('.empty-text').textContent = 'This stock may not have mock data available. Try AAPL, MSFT, NVDA, GOOGL, JPM, or other major tickers.';
      return;
    }

    STATE.stockData = data;

    // Load history
    let history = null;
    try {
      const hRes = await fetch('/api/history/' + ticker + '?range=1y');
      const hJson = await hRes.json();
      if (Array.isArray(hJson)) history = hJson;
    } catch (e) { /* fallback */ }

    if (!history && data.historicalPrices) history = data.historicalPrices;
    STATE.historyData = history;

    $('analysis-loading').classList.add('hidden');
    $('analysis-content').classList.remove('hidden');

    renderStockAnalysis(data, history);
  }

  function renderStockAnalysis(data, history) {
    const ticker = data.ticker || STATE.currentStock;
    const sector = data.profile?.sector || getSector(ticker);
    const aiTier = getAITier(ticker);
    const suit = getSuitability(sector);
    const tierCfg = window.AI_TIER_CONFIG[aiTier];

    renderStockHeader(data, ticker, sector);
    renderSuitabilityBanner(suit, sector);
    renderBadges(data, aiTier, tierCfg);
    renderProfile(data);
    renderFinancialCards(data, suit);
    renderForensicScores(data);
    renderGrowthSection(data, aiTier, tierCfg, suit);
    renderDCFSection(data, suit);
    renderScoreGauge(data, sector, aiTier);
    renderPriceChart(history, data);
    renderResearchChecklist(data, sector, suit);
  }

  function renderStockHeader(data, ticker, sector) {
    const p = data.price || {};
    const pos = (p.dayChange || 0) >= 0;
    $('stock-header').innerHTML = `
      <div class="stock-header-info">
        <div class="stock-ticker">${ticker}</div>
        <div class="stock-name">${data.profile?.industry || ''}</div>
        <div class="stock-sector">${sector} · ${data.profile?.employees ? fmtB(data.profile.employees) + ' employees' : ''}</div>
        <p class="metric-sub mt-12" style="max-width:600px">${(data.profile?.description || '').substring(0, 200)}${(data.profile?.description || '').length > 200 ? '...' : ''}</p>
      </div>
      <div class="stock-price-big">
        <div class="stock-price-value">$${fmt(p.current)}</div>
        <div class="stock-price-change ${pos ? 'change-positive' : 'change-negative'}">
          ${pos ? '▲' : '▼'} $${fmt(Math.abs(p.dayChange || 0))} (${fmt(Math.abs(p.dayChangePercent || 0))}%)
        </div>
        <div class="metric-sub mt-8">Mkt Cap: $${fmtMC(p.marketCap)}</div>
        <div class="metric-sub">52W: $${fmt(p.fiftyTwoWeekLow)} – $${fmt(p.fiftyTwoWeekHigh)}</div>
      </div>
    `;
  }

  function renderSuitabilityBanner(suit, sector) {
    $('suitability-banner').innerHTML = `
      <div class="suitability-banner ${suit.level}">
        <span class="suitability-icon">${suit.level === 'high' ? '✅' : suit.level === 'medium' ? '⚠️' : '🔶'}</span>
        <div class="suitability-text">
          <strong>DCF Suitability: ${suit.label}</strong><br>
          ${suit.description}<br>
          <span style="color:var(--text-dim)">Primary Metrics: ${suit.primaryMetrics.join(', ')}</span>
        </div>
      </div>
    `;
  }

  function renderBadges(data, aiTier, tierCfg) {
    $('stock-badges').innerHTML = `
      <span class="badge badge-ai-tier${aiTier}">AI ${tierCfg.tierName}</span>
      ${data.dividend?.yield > 0 ? `<span class="badge badge-buy">Div Yield: ${fmtPct(data.dividend.yield)}</span>` : ''}
    `;
  }

  function renderProfile(data) {
    const own = data.ownership || {};
    $('profile-section').innerHTML = `
      <div class="card">
        <div class="card-header"><span class="card-title">📋 Key Info</span></div>
        <div class="growth-source-row"><span class="growth-source-name">Sector</span><span class="growth-source-value">${data.profile?.sector || '—'}</span></div>
        <div class="growth-source-row"><span class="growth-source-name">Industry</span><span class="growth-source-value">${data.profile?.industry || '—'}</span></div>
        <div class="growth-source-row"><span class="growth-source-name">Employees</span><span class="growth-source-value">${data.profile?.employees ? fmtB(data.profile.employees) : '—'}</span></div>
        <div class="growth-source-row"><span class="growth-source-name">Shares Outstanding</span><span class="growth-source-value">${data.shares?.outstanding ? fmtB(data.shares.outstanding) : '—'}</span></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🏛️ Ownership</span></div>
        <div class="growth-source-row"><span class="growth-source-name">Institutional</span><span class="growth-source-value">${fmtPct(own.institutionalPercent)}</span></div>
        <div class="growth-source-row"><span class="growth-source-name">Insider</span><span class="growth-source-value">${fmtPct(own.insiderPercent)}</span></div>
        ${(own.topHolders || []).map(h => `<div class="growth-source-row"><span class="growth-source-name" style="padding-left:12px">↳ ${h.name}</span><span class="growth-source-value">${fmtPct(h.percent)}</span></div>`).join('')}
      </div>
    `;
  }

  function renderFinancialCards(data, suit) {
    const v = data.valuation || {};
    const p = data.profitability || {};
    const f = data.financialStrength || {};
    const d = data.dividend || {};
    const m = data.momentum || {};

    $('financial-cards').innerHTML = `
      <div class="grid-4 stagger-fade">
        <div class="card"><div class="card-header"><span class="card-title">📈 Valuation</span></div>
          <div class="metric-grid">
            ${metricItem('P/E (TTM)', fmt(v.peRatioTTM, 1))}
            ${metricItem('P/E (Fwd)', fmt(v.peRatioForward, 1))}
            ${metricItem('P/B', fmt(v.pbRatio, 1))}
            ${metricItem('P/S', fmt(v.psRatio, 1))}
            ${metricItem('EV/EBITDA', fmt(v.evToEbitda, 1))}
            ${metricItem('PEG', fmt(v.pegRatio, 1))}
          </div>
        </div>
        <div class="card"><div class="card-header"><span class="card-title">💰 Profitability</span></div>
          <div class="metric-grid">
            ${metricItem('Gross Margin', fmtPct(p.grossMargin))}
            ${metricItem('Op Margin', fmtPct(p.operatingMargin))}
            ${metricItem('Net Margin', fmtPct(p.netMargin))}
            ${metricItem('ROE', fmtPct(p.roe))}
            ${metricItem('ROA', fmtPct(p.roa))}
            ${metricItem('ROIC', fmtPct(p.roic))}
          </div>
        </div>
        <div class="card"><div class="card-header"><span class="card-title">🛡️ Financial Strength</span></div>
          <div class="metric-grid">
            ${metricItem('Debt/Equity', fmt(f.debtToEquity, 2))}
            ${metricItem('Current Ratio', fmt(f.currentRatio, 2))}
            ${metricItem('Quick Ratio', fmt(f.quickRatio, 2))}
            ${metricItem('Interest Coverage', fmt(f.interestCoverage, 1))}
            ${metricItem('Free Cash Flow', '$' + fmtB(f.freeCashFlow))}
            ${metricItem('Cash', '$' + fmtB(f.totalCash))}
          </div>
        </div>
        <div class="card"><div class="card-header"><span class="card-title">📊 Dividend & Momentum</span></div>
          <div class="metric-grid">
            ${metricItem('Div Yield', fmtPct(d.yield))}
            ${metricItem('Payout Ratio', fmtPct(d.payoutRatio))}
            ${metricItem('5Y Div Growth', fmtPct(d.fiveYearGrowthRate))}
            ${metricItem('RSI (14)', fmt(m.rsi14, 0))}
            ${metricItem('50D SMA', '$' + fmt(m.fiftyDaySMA))}
            ${metricItem('200D SMA', '$' + fmt(m.twoHundredDaySMA))}
          </div>
        </div>
      </div>
    `;
  }

  function metricItem(label, value) {
    return `<div class="metric-item"><div class="metric-label">${label}</div><div class="metric-value">${value}</div></div>`;
  }

  function renderForensicScores(data) {
    const pScore = data.scores?.piotroski;
    const zScore = data.scores?.altmanZ;

    const pColor = pScore >= 7 ? 'var(--accent-emerald)' : pScore >= 4 ? 'var(--accent-amber)' : 'var(--accent-coral)';
    const pLabel = pScore >= 7 ? 'Strong' : pScore >= 4 ? 'Moderate' : 'Weak';

    const zColor = zScore > 2.99 ? 'var(--accent-emerald)' : zScore > 1.81 ? 'var(--accent-amber)' : 'var(--accent-coral)';
    const zLabel = zScore > 2.99 ? 'Safe Zone' : zScore > 1.81 ? 'Grey Zone' : 'Distress Zone';

    // Cash flow vs earnings check
    const fcf = data.financialStrength?.freeCashFlow;
    const netIncome = data.price?.marketCap && data.valuation?.peRatioTTM ? data.price.marketCap / data.valuation.peRatioTTM : null;
    const cfOk = fcf && netIncome && fcf > netIncome * 0.7;

    $('forensic-scores').innerHTML = `
      <div class="card text-center">
        <div class="card-header"><span class="card-title">Piotroski F-Score</span></div>
        <div style="font-size:3rem;font-weight:800;color:${pColor};font-family:var(--font-heading)">${pScore != null ? pScore : '—'}<span style="font-size:1rem;color:var(--text-dim)">/9</span></div>
        <div class="mt-8"><span class="badge" style="background:${pColor}22;color:${pColor};border:1px solid ${pColor}44">${pLabel} Financial Momentum</span></div>
        <p class="metric-sub mt-12">Measures profitability improvement, leverage reduction, and operational efficiency.</p>
      </div>
      <div class="card text-center">
        <div class="card-header"><span class="card-title">Altman Z-Score</span></div>
        <div style="font-size:3rem;font-weight:800;color:${zColor};font-family:var(--font-heading)">${zScore != null ? fmt(zScore, 2) : '—'}</div>
        <div class="mt-8"><span class="badge" style="background:${zColor}22;color:${zColor};border:1px solid ${zColor}44">${zLabel}</span></div>
        <p class="metric-sub mt-12">Bankruptcy probability predictor. > 2.99 = safe, < 1.81 = distress.</p>
      </div>
      <div class="card text-center">
        <div class="card-header"><span class="card-title">Cash Flow Quality</span></div>
        <div style="font-size:3rem;font-weight:800;color:${cfOk ? 'var(--accent-emerald)' : 'var(--accent-coral)'};font-family:var(--font-heading)">${cfOk ? '✓' : '⚠'}</div>
        <div class="mt-8"><span class="badge ${cfOk ? 'badge-safe' : 'badge-danger'}">${cfOk ? 'Cash Flow Aligned' : 'Potential Red Flag'}</span></div>
        <p class="metric-sub mt-12">FCF: $${fmtB(fcf)} vs Est. Net Income: $${fmtB(netIncome)}</p>
      </div>
    `;
  }

  // ─── Growth Projection ─────────────────────────────────
  function renderGrowthSection(data, aiTier, tierCfg, suit) {
    if (suit.level === 'low') {
      $('growth-section').classList.add('hidden');
      return;
    }
    $('growth-section').classList.remove('hidden');

    const g = data.growth || {};
    const baseGrowth = calcBaseGrowth(g);
    const aiBoost = tierCfg.defaultBoost;
    const totalGrowth = baseGrowth + aiBoost;

    const metricsContainer = $('growth-metrics');
    metricsContainer.innerHTML = `
      <div class="card-header"><span class="card-title">📊 Growth Rate Sources</span></div>
      <div class="growth-source-row"><span class="growth-source-name">5Y Revenue CAGR</span><span class="growth-source-value">${fmtPct(g.revenueCAGR5Y)}</span><span class="growth-source-weight">30%</span></div>
      <div class="growth-source-row"><span class="growth-source-name">5Y FCF CAGR</span><span class="growth-source-value">${fmtPct(g.fcfCAGR5Y)}</span><span class="growth-source-weight">20%</span></div>
      <div class="growth-source-row"><span class="growth-source-name">Analyst Consensus (5Y)</span><span class="growth-source-value">${fmtPct(g.analystGrowthEst5Y)}</span><span class="growth-source-weight">40%</span></div>
      <div class="growth-source-row"><span class="growth-source-name">Sector Median</span><span class="growth-source-value">${fmtPct(window.SECTOR_BENCHMARKS[data.profile?.sector]?.medianGrowth)}</span><span class="growth-source-weight">10%</span></div>
      <hr style="border-color:var(--border-subtle);margin:12px 0">
      <div class="growth-source-row"><span class="growth-source-name fw-700">Weighted Base Growth</span><span class="growth-source-value" style="color:var(--accent-teal)">${fmtPct(baseGrowth)}</span></div>
      <div class="slider-group mt-16">
        <div class="slider-header">
          <span class="slider-label">🤖 AI Growth Boost</span>
          <span class="slider-value" id="ai-boost-val">${fmtPct(aiBoost)}</span>
        </div>
        <input type="range" class="ai-slider" id="ai-boost-slider" min="0" max="${tierCfg.maxBoost * 100}" step="0.5" value="${aiBoost * 100}">
      </div>
      <div class="growth-source-row mt-8"><span class="growth-source-name fw-700" style="color:var(--accent-purple)">Total Projected Growth</span><span class="growth-source-value" id="total-growth-val" style="color:var(--accent-purple);font-size:1.2rem">${fmtPct(totalGrowth)}</span></div>
    `;

    // AI slider interaction
    const slider = $('ai-boost-slider');
    slider.addEventListener('input', () => {
      const boost = parseFloat(slider.value) / 100;
      $('ai-boost-val').textContent = fmtPct(boost);
      $('total-growth-val').textContent = fmtPct(baseGrowth + boost);
      renderGrowthChart(data, baseGrowth, boost);
      renderDCFCalc(data, baseGrowth + boost);
      renderScoreGauge(data, data.profile?.sector || getSector(STATE.currentStock), aiTier);
    });

    renderGrowthChart(data, baseGrowth, aiBoost);
  }

  function calcBaseGrowth(g) {
    let total = 0, weight = 0;
    if (g.revenueCAGR5Y != null) { total += g.revenueCAGR5Y * 0.3; weight += 0.3; }
    if (g.fcfCAGR5Y != null && g.fcfCAGR5Y > -0.5) { total += g.fcfCAGR5Y * 0.2; weight += 0.2; }
    if (g.analystGrowthEst5Y != null) { total += g.analystGrowthEst5Y * 0.4; weight += 0.4; }
    const sectorGrowth = 0.06;
    total += sectorGrowth * 0.1; weight += 0.1;
    return weight > 0 ? total / weight * weight : 0.06; // normalize
  }

  function renderGrowthChart(data, baseGrowth, aiBoost) {
    const fcf = data.financialStrength?.freeCashFlow || 1000000000;
    const years = ['Current', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    const baseData = [fcf];
    const aiData = [fcf];
    for (let i = 1; i <= 5; i++) {
      baseData.push(baseData[i - 1] * (1 + baseGrowth));
      aiData.push(aiData[i - 1] * (1 + baseGrowth + aiBoost));
    }

    if (STATE.charts.growth) STATE.charts.growth.destroy();
    STATE.charts.growth = new Chart($('growth-chart'), {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          { label: 'Base Case FCF', data: baseData.map(v => v / 1e9), backgroundColor: 'rgba(6,182,212,0.5)', borderColor: '#06b6d4', borderWidth: 1 },
          { label: 'AI-Enhanced FCF', data: aiData.map(v => v / 1e9), backgroundColor: 'rgba(217,70,239,0.5)', borderColor: '#d946ef', borderWidth: 1 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          y: { ticks: { color: '#64748b', callback: v => '$' + v.toFixed(1) + 'B' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#64748b' }, grid: { display: false } }
        }
      }
    });
  }

  // ─── DCF Calculator ────────────────────────────────────
  function renderDCFSection(data, suit) {
    if (suit.level === 'low') {
      $('dcf-section').classList.add('hidden');
      return;
    }
    $('dcf-section').classList.remove('hidden');

    const g = data.growth || {};
    const baseGrowth = calcBaseGrowth(g);
    const aiTier = getAITier(STATE.currentStock);
    const aiBoost = window.AI_TIER_CONFIG[aiTier].defaultBoost;
    const totalGrowth = baseGrowth + aiBoost;

    $('dcf-sliders').innerHTML = `
      <div class="card-header"><span class="card-title">⚙️ DCF Parameters</span></div>
      <div class="growth-source-row mb-16"><span class="growth-source-name">Latest FCF</span><span class="growth-source-value">$${fmtB(data.financialStrength?.freeCashFlow)}</span></div>
      <div class="growth-source-row mb-16"><span class="growth-source-name">Cash - Debt</span><span class="growth-source-value">$${fmtB((data.financialStrength?.totalCash || 0) - (data.financialStrength?.totalDebt || 0))}</span></div>
      <div class="slider-group">
        <div class="slider-header"><span class="slider-label">Growth Rate</span><span class="slider-value" id="dcf-growth-val">${(totalGrowth * 100).toFixed(1)}%</span></div>
        <input type="range" id="dcf-growth" min="0" max="40" step="0.5" value="${(totalGrowth * 100).toFixed(1)}">
      </div>
      <div class="slider-group">
        <div class="slider-header"><span class="slider-label">Discount Rate (WACC)</span><span class="slider-value" id="dcf-wacc-val">9.0%</span></div>
        <input type="range" id="dcf-wacc" min="4" max="18" step="0.5" value="9">
      </div>
      <div class="slider-group">
        <div class="slider-header"><span class="slider-label">Terminal Growth</span><span class="slider-value" id="dcf-terminal-val">2.5%</span></div>
        <input type="range" id="dcf-terminal" min="0" max="5" step="0.25" value="2.5">
      </div>
    `;

    ['dcf-growth', 'dcf-wacc', 'dcf-terminal'].forEach(id => {
      $(id).addEventListener('input', () => {
        $(`${id}-val`).textContent = $(id).value + '%';
        renderDCFCalc(data, parseFloat($('dcf-growth').value) / 100);
      });
    });

    renderDCFCalc(data, totalGrowth);
  }

  function renderDCFCalc(data, growthOverride) {
    const fcf = data.financialStrength?.freeCashFlow;
    if (!fcf || fcf <= 0) {
      $('dcf-result').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">DCF Not Applicable</div><div class="empty-text">Free Cash Flow is negative or unavailable.</div></div>`;
      return;
    }

    const growth = growthOverride || 0.08;
    const wacc = parseFloat($('dcf-wacc')?.value || '9') / 100;
    const terminal = parseFloat($('dcf-terminal')?.value || '2.5') / 100;
    const shares = data.shares?.outstanding || 1;
    const netCash = (data.financialStrength?.totalCash || 0) - (data.financialStrength?.totalDebt || 0);

    // 5-year DCF
    let pvFCF = 0;
    let projectedFCF = fcf;
    for (let y = 1; y <= 5; y++) {
      projectedFCF *= (1 + growth);
      pvFCF += projectedFCF / Math.pow(1 + wacc, y);
    }

    // Terminal value
    const terminalFCF = projectedFCF * (1 + terminal);
    const terminalValue = terminalFCF / (wacc - terminal);
    const pvTerminal = terminalValue / Math.pow(1 + wacc, 5);

    const totalValue = pvFCF + pvTerminal + netCash;
    const intrinsicValue = totalValue / shares;
    const currentPrice = data.price?.current || 0;
    const margin = currentPrice > 0 ? ((intrinsicValue - currentPrice) / currentPrice) * 100 : 0;

    const isUnder = margin > 10;
    const isOver = margin < -10;
    const cls = isUnder ? 'dcf-undervalued' : isOver ? 'dcf-overvalued' : 'dcf-fair';
    const label = isUnder ? '📈 UNDERVALUED' : isOver ? '📉 OVERVALUED' : '⚖️ FAIRLY VALUED';

    $('dcf-result').innerHTML = `
      <div class="card-header"><span class="card-title">💎 Intrinsic Value</span></div>
      <div class="dcf-intrinsic" style="color:${isUnder ? 'var(--accent-emerald)' : isOver ? 'var(--accent-coral)' : 'var(--accent-amber)'}">$${fmt(intrinsicValue)}</div>
      <div class="dcf-vs">vs Current Price: $${fmt(currentPrice)}</div>
      <div class="dcf-margin ${cls}">${label}<br>Margin of Safety: ${fmt(margin, 1)}%</div>
      <div class="mt-16" style="font-size:0.75rem;color:var(--text-dim)">
        PV of FCF: $${fmtB(pvFCF)} · PV Terminal: $${fmtB(pvTerminal)} · Net Cash: $${fmtB(netCash)}
      </div>
    `;
  }

  // ─── Value Score ────────────────────────────────────────
  function calcValueScore(data, sector, aiTier) {
    if (!data) return 0;
    const suit = getSuitability(sector);
    const v = data.valuation || {};
    const f = data.financialStrength || {};
    const p = data.price || {};
    const m = data.momentum || {};
    const d = data.dividend || {};
    const bench = window.SECTOR_BENCHMARKS[sector] || {};

    let score = 0;
    const isDCF = suit.level !== 'low';

    // DCF Margin of Safety (30% for DCF sectors)
    if (isDCF && f.freeCashFlow > 0 && p.current > 0) {
      const g = data.growth || {};
      const growth = calcBaseGrowth(g) + (window.AI_TIER_CONFIG[aiTier]?.defaultBoost || 0);
      const shares = data.shares?.outstanding || 1;
      const netCash = (f.totalCash || 0) - (f.totalDebt || 0);
      let pvFCF = 0, projFCF = f.freeCashFlow;
      for (let y = 1; y <= 5; y++) { projFCF *= (1 + growth); pvFCF += projFCF / Math.pow(1.09, y); }
      const tv = projFCF * 1.025 / (0.09 - 0.025); const pvTV = tv / Math.pow(1.09, 5);
      const iv = (pvFCF + pvTV + netCash) / shares;
      const margin = (iv - p.current) / p.current;
      score += clamp(margin * 100, 0, 30);
    }

    // P/E vs Sector (10-25%)
    if (v.peRatioTTM && bench.medianPE) {
      const peDiscount = (bench.medianPE - v.peRatioTTM) / bench.medianPE;
      score += clamp(peDiscount * (isDCF ? 30 : 60), 0, isDCF ? 10 : 25);
    }

    // P/B (5-20%)
    if (v.pbRatio && bench.medianPB) {
      const pbDiscount = (bench.medianPB - v.pbRatio) / bench.medianPB;
      score += clamp(pbDiscount * (isDCF ? 20 : 50), 0, isDCF ? 5 : 20);
    }

    // Piotroski (15%)
    const pio = data.scores?.piotroski || calcMockPiotroski(data);
    score += clamp((pio || 0) / 9 * 15, 0, 15);

    // RSI oversold bonus (10%)
    if (m.rsi14 != null) {
      if (m.rsi14 < 30) score += 10;
      else if (m.rsi14 < 40) score += 7;
      else if (m.rsi14 < 50) score += 4;
      else if (m.rsi14 > 70) score -= 3;
    }

    // Distance from 52W low (10%)
    if (p.current && p.fiftyTwoWeekLow && p.fiftyTwoWeekHigh) {
      const range = p.fiftyTwoWeekHigh - p.fiftyTwoWeekLow;
      if (range > 0) {
        const pos = (p.current - p.fiftyTwoWeekLow) / range;
        score += clamp((1 - pos) * 10, 0, 10);
      }
    }

    // Debt safety (10%)
    if (f.debtToEquity != null) {
      if (f.debtToEquity < 0.5) score += 10;
      else if (f.debtToEquity < 1.0) score += 7;
      else if (f.debtToEquity < 1.5) score += 4;
      else if (f.debtToEquity < 2.5) score += 2;
    }

    // Dividend (5%)
    if (d.yield && d.yield > 0.01) score += clamp(d.yield * 100, 0, 5);

    return clamp(Math.round(score), 0, 100);
  }

  function getScoreBadge(score) {
    if (score >= 80) return { label: 'Strong Buy', cls: 'badge-strong-buy', color: 'var(--accent-emerald)' };
    if (score >= 60) return { label: 'Buy', cls: 'badge-buy', color: 'var(--accent-emerald)' };
    if (score >= 40) return { label: 'Hold', cls: 'badge-hold', color: 'var(--accent-amber)' };
    return { label: 'Avoid', cls: 'badge-avoid', color: 'var(--accent-coral)' };
  }

  function renderScoreGauge(data, sector, aiTier) {
    const score = calcValueScore(data, sector, aiTier);
    const badge = getScoreBadge(score);
    const circumference = 2 * Math.PI * 62;
    const offset = circumference - (score / 100) * circumference;

    $('score-gauge').innerHTML = `
      <div class="score-container">
        <div class="score-ring">
          <svg viewBox="0 0 140 140">
            <circle class="score-ring-bg" cx="70" cy="70" r="62"></circle>
            <circle class="score-ring-fill" cx="70" cy="70" r="62" style="stroke:${badge.color};stroke-dasharray:${circumference};stroke-dashoffset:${offset}"></circle>
          </svg>
          <div class="score-value" style="color:${badge.color}">${score}</div>
        </div>
        <div class="score-label">Antigravity Value Score</div>
        <div class="mt-12"><span class="badge ${badge.cls}">${badge.label}</span></div>
      </div>
    `;

    // Score explanation
    const reasons = [];
    const v = data.valuation || {};
    const f = data.financialStrength || {};
    const m = data.momentum || {};
    const bench = window.SECTOR_BENCHMARKS[sector] || {};

    if (v.peRatioTTM && bench.medianPE && v.peRatioTTM < bench.medianPE) reasons.push(`P/E (${fmt(v.peRatioTTM,1)}) is below sector median (${bench.medianPE}), indicating relative value.`);
    if (f.debtToEquity != null && f.debtToEquity < 0.5) reasons.push(`Very low debt-to-equity (${fmt(f.debtToEquity,2)}) signals strong financial health.`);
    if (m.rsi14 && m.rsi14 < 40) reasons.push(`RSI at ${fmt(m.rsi14,0)} suggests oversold conditions — potential buying opportunity.`);
    if (f.freeCashFlow > 0) reasons.push(`Positive Free Cash Flow of $${fmtB(f.freeCashFlow)} supports intrinsic value.`);
    if (data.dividend?.yield > 0.02) reasons.push(`Dividend yield of ${fmtPct(data.dividend.yield)} provides income cushion.`);
    if (v.peRatioTTM && bench.medianPE && v.peRatioTTM > bench.medianPE * 1.5) reasons.push(`P/E (${fmt(v.peRatioTTM,1)}) is significantly above sector median — potentially overvalued.`);
    if (f.debtToEquity > 2.0) reasons.push(`High debt-to-equity (${fmt(f.debtToEquity,2)}) is a risk factor.`);

    $('score-explanation').innerHTML = `
      <div class="card-header"><span class="card-title">📝 Score Explanation</span></div>
      ${reasons.slice(0, 5).map(r => `<div class="checklist-item check-info"><span class="checklist-icon">💡</span><span>${r}</span></div>`).join('')}
    `;
  }

  // ─── Price Chart ────────────────────────────────────────
  function renderPriceChart(history, data) {
    const tabs = $('chart-range-tabs');
    tabs.innerHTML = ['1mo', '6mo', '1y'].map(r => `<button class="tab ${r === '1y' ? 'active' : ''}" data-range="${r}">${r.toUpperCase()}</button>`).join('');

    tabs.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        let h = null;
        try {
          const res = await fetch(`/api/history/${STATE.currentStock}?range=${tab.dataset.range}`);
          const json = await res.json();
          if (Array.isArray(json)) h = json;
        } catch (e) { /* use current */ }
        if (!h && history) {
          const days = tab.dataset.range === '1mo' ? 22 : tab.dataset.range === '6mo' ? 130 : 260;
          h = history.slice(-days);
        }
        drawPriceChart(h || history, data);
      });
    });

    drawPriceChart(history, data);
  }

  function drawPriceChart(history, data) {
    if (!history || !history.length) return;

    const labels = history.map(h => h.date);
    const prices = history.map(h => h.close);

    // Calculate SMAs
    const sma50 = calcSMA(prices, 50);
    const sma200 = calcSMA(prices, 200);

    if (STATE.charts.price) STATE.charts.price.destroy();
    STATE.charts.price = new Chart($('price-chart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Price', data: prices, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.08)', fill: true, borderWidth: 2, pointRadius: 0, tension: 0.3 },
          { label: '50D SMA', data: sma50, borderColor: '#f59e0b', borderWidth: 1.5, pointRadius: 0, borderDash: [5, 3], tension: 0.3 },
          { label: '200D SMA', data: sma200, borderColor: '#f43f5e', borderWidth: 1.5, pointRadius: 0, borderDash: [8, 4], tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          y: { ticks: { color: '#64748b', callback: v => '$' + v.toFixed(0) }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#64748b', maxTicksLimit: 12 }, grid: { display: false } }
        }
      }
    });
  }

  function calcSMA(data, period) {
    return data.map((_, i) => {
      if (i < period - 1) return null;
      const slice = data.slice(i - period + 1, i + 1);
      return slice.reduce((a, b) => a + b, 0) / period;
    });
  }

  // ─── Research Checklist ─────────────────────────────────
  function renderResearchChecklist(data, sector, suit) {
    const items = [];
    const f = data.financialStrength || {};
    const v = data.valuation || {};
    const aiTier = getAITier(STATE.currentStock);

    // Universal
    items.push({ icon: '📝', text: 'Review latest quarterly earnings call transcript for management guidance and forward outlook.', type: 'check-info' });
    items.push({ icon: '📊', text: 'Compare valuation multiples to the 3 closest sector peers.', type: 'check-info' });
    items.push({ icon: '⚖️', text: 'Review ESG controversies, pending litigation, or regulatory investigations.', type: 'check-info' });

    // High debt
    if (f.debtToEquity > 1.5) items.push({ icon: '⚠️', text: `High Debt-to-Equity (${fmt(f.debtToEquity,2)}): Check debt maturity schedule and refinancing risk at current interest rates.`, type: 'check-warning' });
    if (f.interestCoverage && f.interestCoverage < 3) items.push({ icon: '🚨', text: `Low Interest Coverage (${fmt(f.interestCoverage,1)}x): Company may struggle to service its debt. Verify cash flow stability.`, type: 'check-critical' });

    // Financials
    if (sector === 'Financials') {
      items.push({ icon: '🏦', text: 'Analyze Net Interest Margin (NIM) trends over the past 4 quarters.', type: 'check-warning' });
      items.push({ icon: '📉', text: 'Check Non-Performing Loan (NPL) ratio and provision for credit losses.', type: 'check-warning' });
      items.push({ icon: '💰', text: 'Review CET1 capital ratio vs. regulatory minimums (should be > 10%).', type: 'check-info' });
    }

    // REITs
    if (sector === 'Real Estate') {
      items.push({ icon: '🏠', text: 'Verify payout ratio based on AFFO (Adjusted Funds From Operations), not net income.', type: 'check-warning' });
      items.push({ icon: '📊', text: 'Check occupancy rates, lease renewal spreads, and weighted average lease term.', type: 'check-info' });
    }

    // Utilities
    if (sector === 'Utilities') {
      items.push({ icon: '⚡', text: 'Verify regulatory rate case outcomes and approved return on equity.', type: 'check-warning' });
      items.push({ icon: '🏗️', text: 'Review capital expenditure plan and its impact on rate base growth.', type: 'check-info' });
    }

    // AI Stocks
    if (aiTier <= 2) {
      items.push({ icon: '🤖', text: 'Assess competitive moat in AI — can margins survive commoditization of AI models and tools?', type: 'check-warning' });
      items.push({ icon: '📈', text: 'Validate AI revenue growth is sustainable and not a one-time buildout cycle.', type: 'check-info' });
    }

    // Dividend stocks
    if (data.dividend?.yield > 0.02) {
      items.push({ icon: '💵', text: `Verify FCF coverage of dividends (payout ratio: ${fmtPct(data.dividend.payoutRatio)} — should be < 70% for safety).`, type: data.dividend.payoutRatio > 0.7 ? 'check-critical' : 'check-info' });
    }

    // Overvalued
    if (v.peRatioTTM > 50) {
      items.push({ icon: '📊', text: `Very high P/E (${fmt(v.peRatioTTM,1)}): Ensure earnings growth trajectory justifies the premium.`, type: 'check-warning' });
    }

    // Cyclicals
    if (['Energy', 'Basic Materials', 'Industrials'].includes(sector)) {
      items.push({ icon: '🔄', text: 'Check inventory levels, order backlog, and commodity price sensitivity.', type: 'check-info' });
    }

    $('research-checklist').innerHTML = items.map(i => `
      <li class="checklist-item ${i.type}"><span class="checklist-icon">${i.icon}</span><span>${i.text}</span></li>
    `).join('');
  }

  // ─── Research Hub ───────────────────────────────────────
  function renderResearchHub() {
    $('research-hub-content').innerHTML = `
      <div class="grid-2 stagger-fade">
        <div class="card">
          <div class="card-header"><span class="card-title">🏰 1. Competitive Moat</span></div>
          <p class="metric-sub">Look for companies with durable competitive advantages:</p>
          <ul class="checklist mt-12">
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>High ROIC (> 15%) sustained over 5+ years</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Consistent operating margins without erosion</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Brand strength, network effects, or switching costs</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Pricing power — can raise prices without losing customers</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">📊 2. Earnings Quality</span></div>
          <p class="metric-sub">Verify that reported earnings are real and sustainable:</p>
          <ul class="checklist mt-12">
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Operating Cash Flow should exceed Net Income</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Piotroski F-Score ≥ 7 (strong financial momentum)</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Consistent revenue recognition practices (no channel stuffing)</li>
            <li class="checklist-item check-warning"><span class="checklist-icon">⚠️</span>Watch for growing receivables outpacing revenue growth</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">🛡️ 3. Debt & Solvency</span></div>
          <p class="metric-sub">Ensure the company can survive economic downturns:</p>
          <ul class="checklist mt-12">
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Debt-to-Equity < 1.5 (or appropriate for sector)</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Interest Coverage > 3x</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Current Ratio > 1.2</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Altman Z-Score > 2.99 (safe zone)</li>
            <li class="checklist-item check-warning"><span class="checklist-icon">⚠️</span>Check debt maturity schedule — near-term maturities in high-rate environments are dangerous</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">🤖 4. AI Impact Assessment</span></div>
          <p class="metric-sub">Evaluate how AI will affect the business:</p>
          <ul class="checklist mt-12">
            <li class="checklist-item check-info"><span class="checklist-icon">🟢</span><strong>Enablers:</strong> NVDA, AMD, AVGO — Selling the "picks and shovels" of AI</li>
            <li class="checklist-item check-info"><span class="checklist-icon">🟢</span><strong>Adopters:</strong> MSFT, GOOGL, META — AI enhances products and margins</li>
            <li class="checklist-item check-info"><span class="checklist-icon">🟡</span><strong>Beneficiaries:</strong> JPM, WMT — AI optimizes operations</li>
            <li class="checklist-item check-warning"><span class="checklist-icon">🔴</span><strong>Vulnerable:</strong> Companies whose services can be replaced by AI at lower cost</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">📈 5. Growth vs. Value</span></div>
          <p class="metric-sub">Balance growth potential against current price:</p>
          <ul class="checklist mt-12">
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>PEG Ratio < 1.5 (growth at reasonable price)</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Revenue growth accelerating or at least stable</li>
            <li class="checklist-item check-info"><span class="checklist-icon">✅</span>Expanding margins — operating leverage at work</li>
            <li class="checklist-item check-warning"><span class="checklist-icon">⚠️</span>Beware of "growth at any cost" — watch stock-based compensation dilution</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">🧪 6. Sector-Specific Checks</span></div>
          <p class="metric-sub">Different sectors require different lenses:</p>
          <ul class="checklist mt-12">
            <li class="checklist-item check-info"><span class="checklist-icon">🏦</span><strong>Banks:</strong> NIM trend, NPL ratio, CET1 capital, deposit stability</li>
            <li class="checklist-item check-info"><span class="checklist-icon">🏠</span><strong>REITs:</strong> FFO, occupancy, lease terms, AFFO payout ratio</li>
            <li class="checklist-item check-info"><span class="checklist-icon">⚡</span><strong>Utilities:</strong> Rate case outcomes, rate base growth, allowed ROE</li>
            <li class="checklist-item check-info"><span class="checklist-icon">⛽</span><strong>Energy:</strong> Break-even oil price, reserve replacement ratio, hedging</li>
            <li class="checklist-item check-info"><span class="checklist-icon">💊</span><strong>Pharma:</strong> Pipeline depth, patent cliff timeline, FDA approvals</li>
          </ul>
        </div>
      </div>
    `;
  }

  // ─── Basket / Fund Builder ──────────────────────────────
  function initBaskets() {
    if (!STATE.activeBasket || !STATE.baskets[STATE.activeBasket]) {
      if (Object.keys(STATE.baskets).length === 0) {
        STATE.baskets['Default Portfolio'] = [];
        STATE.activeBasket = 'Default Portfolio';
        saveBaskets();
      } else {
        STATE.activeBasket = Object.keys(STATE.baskets)[0];
      }
    }
    updateBasketSelector();
  }

  function saveBaskets() {
    localStorage.setItem('vs_baskets', JSON.stringify(STATE.baskets));
    localStorage.setItem('vs_activeBasket', STATE.activeBasket);
  }

  function updateBasketSelector() {
    const sel = $('basket-select');
    sel.innerHTML = Object.keys(STATE.baskets).map(name => `<option value="${name}" ${name === STATE.activeBasket ? 'selected' : ''}>${name}</option>`).join('');
    sel.onchange = () => { STATE.activeBasket = sel.value; renderBasket(); };
  }

  // Add to basket button
  $('btn-add-basket')?.addEventListener('click', () => {
    if (!STATE.currentStock) return;
    const shares = parseInt($('basket-shares-input').value) || 10;
    const existing = STATE.baskets[STATE.activeBasket]?.find(h => h.ticker === STATE.currentStock);
    if (existing) {
      existing.shares += shares;
    } else {
      if (!STATE.baskets[STATE.activeBasket]) STATE.baskets[STATE.activeBasket] = [];
      const data = STATE.stockData;
      STATE.baskets[STATE.activeBasket].push({
        ticker: STATE.currentStock,
        name: data?.profile?.industry || window.STOCK_UNIVERSE.find(s => s.ticker === STATE.currentStock)?.name || STATE.currentStock,
        shares,
        priceAtAdd: data?.price?.current || 0,
        sector: data?.profile?.sector || getSector(STATE.currentStock)
      });
    }
    saveBaskets();
    // Show feedback
    const btn = $('btn-add-basket');
    btn.textContent = '✓ Added!';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-primary');
    setTimeout(() => { btn.textContent = '+ Add to Basket'; btn.classList.remove('btn-primary'); btn.classList.add('btn-success'); }, 1500);
  });

  // New basket
  $('btn-new-basket')?.addEventListener('click', () => {
    $('modal-overlay').classList.add('visible');
    $('modal-basket-name').value = '';
    $('modal-basket-name').focus();
  });

  $('modal-cancel')?.addEventListener('click', () => $('modal-overlay').classList.remove('visible'));
  $('modal-confirm')?.addEventListener('click', () => {
    const name = $('modal-basket-name').value.trim();
    if (name && !STATE.baskets[name]) {
      STATE.baskets[name] = [];
      STATE.activeBasket = name;
      saveBaskets();
      updateBasketSelector();
      renderBasket();
    }
    $('modal-overlay').classList.remove('visible');
  });

  // Export
  $('btn-export-basket')?.addEventListener('click', () => {
    const holdings = STATE.baskets[STATE.activeBasket] || [];
    if (!holdings.length) return;
    const csv = 'Ticker,Shares,Price,Sector\n' + holdings.map(h => `${h.ticker},${h.shares},${h.priceAtAdd},${h.sector}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${STATE.activeBasket.replace(/\s+/g, '_')}.csv`;
    a.click();
  });

  function renderBasket() {
    updateBasketSelector();
    const holdings = STATE.baskets[STATE.activeBasket] || [];

    if (!holdings.length) {
      $('basket-holdings').innerHTML = '';
      $('basket-empty').classList.remove('hidden');
      $('portfolio-metrics').innerHTML = '';
      return;
    }

    $('basket-empty').classList.add('hidden');

    // Render holdings list
    $('basket-holdings').innerHTML = holdings.map((h, i) => {
      const mockData = window.MOCK_DATA[h.ticker];
      const currentPrice = mockData?.price?.current || h.priceAtAdd;
      const value = currentPrice * h.shares;
      return `<div class="basket-item">
        <span class="basket-ticker" style="cursor:pointer" onclick="window._navStock('${h.ticker}')">${h.ticker}</span>
        <span class="basket-name">${h.name}</span>
        <span style="color:var(--text-muted);font-size:0.8rem">${h.sector}</span>
        <span style="min-width:60px;text-align:right">${h.shares} shares</span>
        <span class="basket-weight">$${fmtB(value)}</span>
        <button class="btn btn-danger btn-sm" onclick="window._removeHolding(${i})">✕</button>
      </div>`;
    }).join('');

    // Portfolio metrics
    let totalValue = 0, weightedPE = 0, weightedBeta = 0, weightedDivYield = 0, weightedAI = 0;
    const sectorAlloc = {};
    let valuedCount = 0;

    holdings.forEach(h => {
      const d = window.MOCK_DATA[h.ticker];
      const price = d?.price?.current || h.priceAtAdd;
      const val = price * h.shares;
      totalValue += val;
    });

    holdings.forEach(h => {
      const d = window.MOCK_DATA[h.ticker];
      const price = d?.price?.current || h.priceAtAdd;
      const val = price * h.shares;
      const w = totalValue > 0 ? val / totalValue : 0;

      if (d?.valuation?.peRatioTTM) { weightedPE += d.valuation.peRatioTTM * w; valuedCount++; }
      if (d?.dividend?.yield) weightedDivYield += d.dividend.yield * w;
      const aiTier = getAITier(h.ticker);
      weightedAI += (5 - aiTier) / 3 * 100 * w; // Convert tier to 0-100 score

      const sec = h.sector || 'Unknown';
      sectorAlloc[sec] = (sectorAlloc[sec] || 0) + w;
    });

    $('portfolio-metrics').innerHTML = `
      ${metricCard('Total Value', '$' + fmtB(totalValue), '💰')}
      ${metricCard('Holdings', holdings.length, '📦')}
      ${metricCard('Weighted P/E', fmt(weightedPE, 1), '📈')}
      ${metricCard('Weighted Div Yield', fmtPct(weightedDivYield), '💵')}
    `;

    // Sector Pie Chart
    renderSectorPie(sectorAlloc);
  }

  function metricCard(label, value, icon) {
    return `<div class="card text-center"><div style="font-size:1.5rem;margin-bottom:8px">${icon}</div><div class="metric-value">${value}</div><div class="metric-label mt-8">${label}</div></div>`;
  }

  window._removeHolding = idx => {
    STATE.baskets[STATE.activeBasket].splice(idx, 1);
    saveBaskets();
    renderBasket();
  };

  function renderSectorPie(sectorAlloc) {
    const sectors = Object.keys(sectorAlloc);
    const values = Object.values(sectorAlloc).map(v => (v * 100).toFixed(1));
    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#d946ef', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

    if (STATE.charts.sectorPie) STATE.charts.sectorPie.destroy();
    const canvas = $('sector-pie-chart');
    if (!canvas) return;
    STATE.charts.sectorPie = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: sectors,
        datasets: [{ data: values, backgroundColor: colors.slice(0, sectors.length), borderWidth: 0 }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 } } }
        }
      }
    });
  }

  // ─── Piotroski/Altman Mock Calculators ──────────────────
  function calcMockPiotroski(data) {
    if (!data) return null;
    let score = 0;
    const p = data.profitability || {};
    const f = data.financialStrength || {};
    const g = data.growth || {};

    if (p.netMargin > 0) score++;
    if (f.freeCashFlow > 0) score++;
    if (p.roa > 0) score++;
    if (f.freeCashFlow > 0 && p.netMargin > 0) score++; // FCF > NI proxy
    if (f.debtToEquity < 1.5) score++;
    if (f.currentRatio > 1.0) score++;
    score++; // Assume no dilution
    if (p.grossMargin > 0.3) score++;
    if (g.revenueCAGR3Y > 0) score++;
    return Math.min(score, 9);
  }

  function calcMockAltman(data) {
    if (!data || !data.price) return null;
    const f = data.financialStrength || {};
    const p = data.profitability || {};
    const pr = data.price || {};

    const ta = pr.marketCap / Math.max(p.roa || 0.05, 0.01);
    if (!ta || ta <= 0) return null;

    const wc = (f.currentRatio || 1) * ta * 0.1;
    const re = ta * 0.15;
    const ebit = (p.operatingMargin || 0.1) * pr.marketCap / (data.valuation?.peRatioTTM || 20);
    const mve = pr.marketCap;
    const tl = f.totalDebt || pr.marketCap * 0.3;
    const s = pr.marketCap / (data.valuation?.psRatio || 5);

    const z = 1.2 * (wc / ta) + 1.4 * (re / ta) + 3.3 * (ebit / ta) + 0.6 * (mve / tl) + 1.0 * (s / ta);
    return Math.round(z * 100) / 100;
  }

  // ─── Init ───────────────────────────────────────────────
  initBaskets();
  renderDashboard();

})();
