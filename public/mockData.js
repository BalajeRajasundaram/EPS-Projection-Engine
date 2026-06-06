// ============================================================
// Mock Data — Comprehensive offline fallback for 50 major US stocks
// ============================================================

(function() {
  // Helper: generate realistic historical prices
  function genPrices(startPrice, trend, volatility, days) {
    const prices = [];
    let price = startPrice * (1 - trend * days / 252); // work backwards
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const dailyReturn = (trend / 252) + (Math.random() - 0.48) * volatility;
      price = price * (1 + dailyReturn);
      prices.push({ date: d.toISOString().split('T')[0], close: Math.round(price * 100) / 100 });
    }
    return prices;
  }

  function stock(profile, price, valuation, profitability, financialStrength, dividend, momentum, growth, ownership, shares, hp) {
    return { profile, price, valuation, profitability, financialStrength, dividend, momentum, growth, ownership, shares, historicalPrices: hp };
  }

  window.MOCK_DATA = {};

  // ===== TECHNOLOGY =====
  window.MOCK_DATA['AAPL'] = stock(
    { sector:'Technology', industry:'Consumer Electronics', description:'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', employees:164000, website:'apple.com' },
    { current:192.50, previousClose:191.80, dayChange:0.70, dayChangePercent:0.36, fiftyTwoWeekHigh:199.62, fiftyTwoWeekLow:164.08, marketCap:2980000000000, volume:54200000, avgVolume:57800000 },
    { peRatioTTM:30.5, peRatioForward:28.2, pbRatio:47.2, psRatio:7.8, evToEbitda:24.1, pegRatio:2.8 },
    { grossMargin:0.461, operatingMargin:0.303, netMargin:0.262, roe:1.60, roa:0.287, roic:0.55 },
    { debtToEquity:1.76, currentRatio:1.07, quickRatio:0.84, interestCoverage:29.1, freeCashFlow:111000000000, totalCash:62000000000, totalDebt:111000000000 },
    { yield:0.005, payoutRatio:0.155, fiveYearGrowthRate:0.06 },
    { rsi14:55, fiftyDaySMA:188.50, twoHundredDaySMA:182.30 },
    { revenueCAGR3Y:0.06, revenueCAGR5Y:0.08, fcfCAGR3Y:0.05, fcfCAGR5Y:0.07, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.61, insiderPercent:0.0007, topHolders:[{name:'Vanguard Group',percent:0.084},{name:'BlackRock',percent:0.065},{name:'Berkshire Hathaway',percent:0.058}] },
    { outstanding:15460000000, floatShares:15390000000 },
    genPrices(192.50, 0.15, 0.018, 260)
  );

  window.MOCK_DATA['MSFT'] = stock(
    { sector:'Technology', industry:'Software—Infrastructure', description:'Microsoft develops and licenses software, services, devices, and solutions worldwide.', employees:221000, website:'microsoft.com' },
    { current:420.50, previousClose:418.90, dayChange:1.60, dayChangePercent:0.38, fiftyTwoWeekHigh:430.82, fiftyTwoWeekLow:309.45, marketCap:3120000000000, volume:22100000, avgVolume:24500000 },
    { peRatioTTM:35.8, peRatioForward:31.2, pbRatio:12.5, psRatio:13.8, evToEbitda:25.6, pegRatio:2.1 },
    { grossMargin:0.695, operatingMargin:0.445, netMargin:0.362, roe:0.388, roa:0.193, roic:0.28 },
    { debtToEquity:0.35, currentRatio:1.77, quickRatio:1.54, interestCoverage:47.5, freeCashFlow:63000000000, totalCash:80000000000, totalDebt:59000000000 },
    { yield:0.007, payoutRatio:0.25, fiveYearGrowthRate:0.10 },
    { rsi14:62, fiftyDaySMA:412.00, twoHundredDaySMA:385.20 },
    { revenueCAGR3Y:0.14, revenueCAGR5Y:0.15, fcfCAGR3Y:0.12, fcfCAGR5Y:0.16, analystGrowthEst5Y:0.15 },
    { institutionalPercent:0.72, insiderPercent:0.014, topHolders:[{name:'Vanguard Group',percent:0.088},{name:'BlackRock',percent:0.073},{name:'State Street',percent:0.04}] },
    { outstanding:7430000000, floatShares:7410000000 },
    genPrices(420.50, 0.28, 0.016, 260)
  );

  window.MOCK_DATA['NVDA'] = stock(
    { sector:'Technology', industry:'Semiconductors', description:'NVIDIA designs GPU accelerators for gaming, professional visualization, data center, and automotive markets.', employees:29600, website:'nvidia.com' },
    { current:875.30, previousClose:868.20, dayChange:7.10, dayChangePercent:0.82, fiftyTwoWeekHigh:974.00, fiftyTwoWeekLow:298.06, marketCap:2150000000000, volume:42500000, avgVolume:48200000 },
    { peRatioTTM:65.2, peRatioForward:38.5, pbRatio:52.0, psRatio:35.2, evToEbitda:50.8, pegRatio:1.2 },
    { grossMargin:0.742, operatingMargin:0.620, netMargin:0.554, roe:1.15, roa:0.556, roic:0.82 },
    { debtToEquity:0.41, currentRatio:4.17, quickRatio:3.52, interestCoverage:132, freeCashFlow:27000000000, totalCash:26000000000, totalDebt:11000000000 },
    { yield:0.0002, payoutRatio:0.01, fiveYearGrowthRate:0.0 },
    { rsi14:68, fiftyDaySMA:820.00, twoHundredDaySMA:650.00 },
    { revenueCAGR3Y:0.52, revenueCAGR5Y:0.45, fcfCAGR3Y:0.68, fcfCAGR5Y:0.55, analystGrowthEst5Y:0.35 },
    { institutionalPercent:0.68, insiderPercent:0.041, topHolders:[{name:'Vanguard Group',percent:0.087},{name:'BlackRock',percent:0.072},{name:'FMR LLC',percent:0.032}] },
    { outstanding:2460000000, floatShares:2410000000 },
    genPrices(875.30, 0.85, 0.03, 260)
  );

  window.MOCK_DATA['GOOGL'] = stock(
    { sector:'Communication Services', industry:'Internet Content & Information', description:'Alphabet provides online advertising services, cloud computing, software, and hardware.', employees:182500, website:'abc.xyz' },
    { current:172.80, previousClose:171.50, dayChange:1.30, dayChangePercent:0.76, fiftyTwoWeekHigh:180.10, fiftyTwoWeekLow:120.21, marketCap:2130000000000, volume:25300000, avgVolume:27100000 },
    { peRatioTTM:24.5, peRatioForward:21.2, pbRatio:6.8, psRatio:6.5, evToEbitda:17.2, pegRatio:1.1 },
    { grossMargin:0.574, operatingMargin:0.308, netMargin:0.259, roe:0.295, roa:0.172, roic:0.24 },
    { debtToEquity:0.05, currentRatio:2.10, quickRatio:1.95, interestCoverage:280, freeCashFlow:69000000000, totalCash:110000000000, totalDebt:14000000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:0.0 },
    { rsi14:58, fiftyDaySMA:168.00, twoHundredDaySMA:148.50 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.18, fcfCAGR3Y:0.15, fcfCAGR5Y:0.20, analystGrowthEst5Y:0.16 },
    { institutionalPercent:0.63, insiderPercent:0.058, topHolders:[{name:'Vanguard Group',percent:0.074},{name:'BlackRock',percent:0.062},{name:'State Street',percent:0.035}] },
    { outstanding:12330000000, floatShares:11450000000 },
    genPrices(172.80, 0.35, 0.02, 260)
  );

  window.MOCK_DATA['META'] = stock(
    { sector:'Communication Services', industry:'Internet Content & Information', description:'Meta Platforms operates Facebook, Instagram, WhatsApp, and Reality Labs.', employees:67300, website:'meta.com' },
    { current:505.20, previousClose:502.10, dayChange:3.10, dayChangePercent:0.62, fiftyTwoWeekHigh:542.81, fiftyTwoWeekLow:274.38, marketCap:1290000000000, volume:15800000, avgVolume:17200000 },
    { peRatioTTM:28.8, peRatioForward:22.5, pbRatio:8.2, psRatio:9.1, evToEbitda:18.5, pegRatio:1.3 },
    { grossMargin:0.811, operatingMargin:0.414, netMargin:0.346, roe:0.336, roa:0.214, roic:0.26 },
    { debtToEquity:0.21, currentRatio:2.68, quickRatio:2.45, interestCoverage:98, freeCashFlow:43000000000, totalCash:61000000000, totalDebt:18000000000 },
    { yield:0.003, payoutRatio:0.08, fiveYearGrowthRate:null },
    { rsi14:61, fiftyDaySMA:490.00, twoHundredDaySMA:420.00 },
    { revenueCAGR3Y:0.11, revenueCAGR5Y:0.16, fcfCAGR3Y:0.18, fcfCAGR5Y:0.22, analystGrowthEst5Y:0.18 },
    { institutionalPercent:0.78, insiderPercent:0.137, topHolders:[{name:'Vanguard Group',percent:0.082},{name:'BlackRock',percent:0.068},{name:'FMR LLC',percent:0.045}] },
    { outstanding:2550000000, floatShares:2200000000 },
    genPrices(505.20, 0.65, 0.025, 260)
  );

  window.MOCK_DATA['AVGO'] = stock(
    { sector:'Technology', industry:'Semiconductors', description:'Broadcom designs, develops, and supplies semiconductor and infrastructure software solutions.', employees:20000, website:'broadcom.com' },
    { current:1340.00, previousClose:1332.00, dayChange:8.00, dayChangePercent:0.60, fiftyTwoWeekHigh:1438.00, fiftyTwoWeekLow:795.18, marketCap:625000000000, volume:3200000, avgVolume:3800000 },
    { peRatioTTM:38.5, peRatioForward:28.0, pbRatio:10.5, psRatio:16.2, evToEbitda:25.8, pegRatio:1.8 },
    { grossMargin:0.742, operatingMargin:0.452, netMargin:0.295, roe:0.365, roa:0.112, roic:0.18 },
    { debtToEquity:1.64, currentRatio:1.10, quickRatio:0.92, interestCoverage:9.5, freeCashFlow:18000000000, totalCash:12000000000, totalDebt:73000000000 },
    { yield:0.014, payoutRatio:0.53, fiveYearGrowthRate:0.12 },
    { rsi14:57, fiftyDaySMA:1290.00, twoHundredDaySMA:1050.00 },
    { revenueCAGR3Y:0.18, revenueCAGR5Y:0.20, fcfCAGR3Y:0.22, fcfCAGR5Y:0.25, analystGrowthEst5Y:0.20 },
    { institutionalPercent:0.81, insiderPercent:0.021, topHolders:[{name:'Vanguard Group',percent:0.088},{name:'BlackRock',percent:0.075},{name:'Capital Group',percent:0.048}] },
    { outstanding:467000000, floatShares:458000000 },
    genPrices(1340.00, 0.55, 0.022, 260)
  );

  window.MOCK_DATA['ADBE'] = stock(
    { sector:'Technology', industry:'Software—Application', description:'Adobe provides digital media creation and marketing software.', employees:29940, website:'adobe.com' },
    { current:555.00, previousClose:551.30, dayChange:3.70, dayChangePercent:0.67, fiftyTwoWeekHigh:638.25, fiftyTwoWeekLow:433.97, marketCap:245000000000, volume:3100000, avgVolume:3500000 },
    { peRatioTTM:45.2, peRatioForward:28.5, pbRatio:16.8, psRatio:12.5, evToEbitda:30.2, pegRatio:2.0 },
    { grossMargin:0.880, operatingMargin:0.368, netMargin:0.267, roe:0.376, roa:0.165, roic:0.22 },
    { debtToEquity:0.48, currentRatio:1.11, quickRatio:1.05, interestCoverage:35, freeCashFlow:7800000000, totalCash:7600000000, totalDebt:5600000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:48, fiftyDaySMA:560.00, twoHundredDaySMA:540.00 },
    { revenueCAGR3Y:0.11, revenueCAGR5Y:0.14, fcfCAGR3Y:0.13, fcfCAGR5Y:0.15, analystGrowthEst5Y:0.13 },
    { institutionalPercent:0.85, insiderPercent:0.003, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.076},{name:'T. Rowe Price',percent:0.042}] },
    { outstanding:441000000, floatShares:438000000 },
    genPrices(555.00, 0.12, 0.02, 260)
  );

  window.MOCK_DATA['CRM'] = stock(
    { sector:'Technology', industry:'Software—Application', description:'Salesforce provides cloud-based CRM software and enterprise applications.', employees:79000, website:'salesforce.com' },
    { current:272.00, previousClose:270.20, dayChange:1.80, dayChangePercent:0.67, fiftyTwoWeekHigh:318.72, fiftyTwoWeekLow:212.00, marketCap:263000000000, volume:5400000, avgVolume:6100000 },
    { peRatioTTM:46.5, peRatioForward:26.8, pbRatio:4.5, psRatio:7.6, evToEbitda:24.8, pegRatio:1.6 },
    { grossMargin:0.765, operatingMargin:0.218, netMargin:0.155, roe:0.098, roa:0.054, roic:0.08 },
    { debtToEquity:0.18, currentRatio:1.08, quickRatio:1.02, interestCoverage:22, freeCashFlow:11500000000, totalCash:8400000000, totalDebt:9600000000 },
    { yield:0.006, payoutRatio:0.28, fiveYearGrowthRate:null },
    { rsi14:52, fiftyDaySMA:268.00, twoHundredDaySMA:255.00 },
    { revenueCAGR3Y:0.16, revenueCAGR5Y:0.20, fcfCAGR3Y:0.24, fcfCAGR5Y:0.28, analystGrowthEst5Y:0.12 },
    { institutionalPercent:0.82, insiderPercent:0.035, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:967000000, floatShares:935000000 },
    genPrices(272.00, 0.18, 0.022, 260)
  );

  window.MOCK_DATA['AMD'] = stock(
    { sector:'Technology', industry:'Semiconductors', description:'AMD designs and sells microprocessors, GPUs, and adaptive SoC products.', employees:26000, website:'amd.com' },
    { current:165.80, previousClose:163.50, dayChange:2.30, dayChangePercent:1.41, fiftyTwoWeekHigh:227.30, fiftyTwoWeekLow:93.12, marketCap:268000000000, volume:48500000, avgVolume:52000000 },
    { peRatioTTM:230.0, peRatioForward:35.5, pbRatio:4.8, psRatio:11.2, evToEbitda:62.5, pegRatio:1.5 },
    { grossMargin:0.505, operatingMargin:0.055, netMargin:0.034, roe:0.021, roa:0.012, roic:0.015 },
    { debtToEquity:0.04, currentRatio:2.51, quickRatio:1.88, interestCoverage:15.5, freeCashFlow:1200000000, totalCash:5800000000, totalDebt:2500000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:45, fiftyDaySMA:170.00, twoHundredDaySMA:155.00 },
    { revenueCAGR3Y:0.18, revenueCAGR5Y:0.32, fcfCAGR3Y:0.10, fcfCAGR5Y:0.25, analystGrowthEst5Y:0.28 },
    { institutionalPercent:0.76, insiderPercent:0.012, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.075},{name:'Capital Group',percent:0.05}] },
    { outstanding:1616000000, floatShares:1600000000 },
    genPrices(165.80, 0.40, 0.032, 260)
  );

  window.MOCK_DATA['INTC'] = stock(
    { sector:'Technology', industry:'Semiconductors', description:'Intel designs and manufactures integrated circuits for computing and communications.', employees:124800, website:'intel.com' },
    { current:31.20, previousClose:31.50, dayChange:-0.30, dayChangePercent:-0.95, fiftyTwoWeekHigh:51.28, fiftyTwoWeekLow:26.86, marketCap:131000000000, volume:48200000, avgVolume:51000000 },
    { peRatioTTM:108.0, peRatioForward:22.5, pbRatio:1.2, psRatio:2.4, evToEbitda:25.0, pegRatio:3.5 },
    { grossMargin:0.412, operatingMargin:0.012, netMargin:-0.016, roe:-0.018, roa:-0.008, roic:-0.01 },
    { debtToEquity:0.47, currentRatio:1.53, quickRatio:1.08, interestCoverage:1.8, freeCashFlow:-14000000000, totalCash:25000000000, totalDebt:50000000000 },
    { yield:0.016, payoutRatio:1.72, fiveYearGrowthRate:-0.05 },
    { rsi14:38, fiftyDaySMA:34.00, twoHundredDaySMA:38.00 },
    { revenueCAGR3Y:-0.10, revenueCAGR5Y:-0.06, fcfCAGR3Y:-0.35, fcfCAGR5Y:-0.20, analystGrowthEst5Y:0.05 },
    { institutionalPercent:0.65, insiderPercent:0.003, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.04}] },
    { outstanding:4200000000, floatShares:4190000000 },
    genPrices(31.20, -0.25, 0.028, 260)
  );

  // ===== HEALTHCARE =====
  window.MOCK_DATA['JNJ'] = stock(
    { sector:'Healthcare', industry:'Drug Manufacturers', description:'Johnson & Johnson develops and sells healthcare products worldwide.', employees:131900, website:'jnj.com' },
    { current:158.40, previousClose:157.80, dayChange:0.60, dayChangePercent:0.38, fiftyTwoWeekHigh:175.97, fiftyTwoWeekLow:143.13, marketCap:381000000000, volume:7200000, avgVolume:7800000 },
    { peRatioTTM:10.5, peRatioForward:14.8, pbRatio:5.8, psRatio:4.5, evToEbitda:13.8, pegRatio:2.5 },
    { grossMargin:0.688, operatingMargin:0.264, netMargin:0.421, roe:0.528, roa:0.107, roic:0.17 },
    { debtToEquity:0.44, currentRatio:1.16, quickRatio:0.88, interestCoverage:20.5, freeCashFlow:18500000000, totalCash:23000000000, totalDebt:30000000000 },
    { yield:0.030, payoutRatio:0.31, fiveYearGrowthRate:0.055 },
    { rsi14:42, fiftyDaySMA:161.00, twoHundredDaySMA:160.50 },
    { revenueCAGR3Y:0.04, revenueCAGR5Y:0.05, fcfCAGR3Y:0.06, fcfCAGR5Y:0.04, analystGrowthEst5Y:0.04 },
    { institutionalPercent:0.70, insiderPercent:0.001, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.075},{name:'State Street',percent:0.045}] },
    { outstanding:2410000000, floatShares:2400000000 },
    genPrices(158.40, 0.02, 0.014, 260)
  );

  window.MOCK_DATA['LLY'] = stock(
    { sector:'Healthcare', industry:'Drug Manufacturers', description:'Eli Lilly discovers, develops, and markets human pharmaceuticals including diabetes and oncology treatments.', employees:43000, website:'lilly.com' },
    { current:790.00, previousClose:785.50, dayChange:4.50, dayChangePercent:0.57, fiftyTwoWeekHigh:810.00, fiftyTwoWeekLow:395.56, marketCap:750000000000, volume:3200000, avgVolume:3800000 },
    { peRatioTTM:118.0, peRatioForward:52.0, pbRatio:62.0, psRatio:21.5, evToEbitda:72.0, pegRatio:3.8 },
    { grossMargin:0.805, operatingMargin:0.315, netMargin:0.182, roe:0.685, roa:0.115, roic:0.18 },
    { debtToEquity:2.50, currentRatio:1.21, quickRatio:0.85, interestCoverage:14.5, freeCashFlow:4500000000, totalCash:3000000000, totalDebt:22000000000 },
    { yield:0.007, payoutRatio:0.85, fiveYearGrowthRate:0.15 },
    { rsi14:64, fiftyDaySMA:750.00, twoHundredDaySMA:620.00 },
    { revenueCAGR3Y:0.10, revenueCAGR5Y:0.12, fcfCAGR3Y:0.08, fcfCAGR5Y:0.10, analystGrowthEst5Y:0.22 },
    { institutionalPercent:0.82, insiderPercent:0.001, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.07},{name:'Capital Group',percent:0.055}] },
    { outstanding:950000000, floatShares:948000000 },
    genPrices(790.00, 0.75, 0.022, 260)
  );

  window.MOCK_DATA['UNH'] = stock(
    { sector:'Healthcare', industry:'Healthcare Plans', description:'UnitedHealth Group operates healthcare and well-being services.', employees:400000, website:'unitedhealthgroup.com' },
    { current:520.00, previousClose:518.50, dayChange:1.50, dayChangePercent:0.29, fiftyTwoWeekHigh:554.70, fiftyTwoWeekLow:436.38, marketCap:480000000000, volume:3500000, avgVolume:3900000 },
    { peRatioTTM:22.8, peRatioForward:19.5, pbRatio:6.2, psRatio:1.4, evToEbitda:14.5, pegRatio:1.5 },
    { grossMargin:0.248, operatingMargin:0.088, netMargin:0.062, roe:0.268, roa:0.079, roic:0.14 },
    { debtToEquity:0.72, currentRatio:0.78, quickRatio:0.72, interestCoverage:12.5, freeCashFlow:22000000000, totalCash:28000000000, totalDebt:58000000000 },
    { yield:0.014, payoutRatio:0.32, fiveYearGrowthRate:0.14 },
    { rsi14:50, fiftyDaySMA:525.00, twoHundredDaySMA:510.00 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.13, fcfCAGR3Y:0.10, fcfCAGR5Y:0.11, analystGrowthEst5Y:0.13 },
    { institutionalPercent:0.87, insiderPercent:0.005, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:923000000, floatShares:918000000 },
    genPrices(520.00, 0.12, 0.016, 260)
  );

  window.MOCK_DATA['PFE'] = stock(
    { sector:'Healthcare', industry:'Drug Manufacturers', description:'Pfizer discovers, develops, and sells medicines, vaccines, and consumer healthcare products.', employees:88000, website:'pfizer.com' },
    { current:27.50, previousClose:27.80, dayChange:-0.30, dayChangePercent:-1.08, fiftyTwoWeekHigh:33.73, fiftyTwoWeekLow:25.20, marketCap:155000000000, volume:35200000, avgVolume:38000000 },
    { peRatioTTM:45.0, peRatioForward:10.8, pbRatio:1.5, psRatio:2.7, evToEbitda:18.0, pegRatio:0.9 },
    { grossMargin:0.594, operatingMargin:0.052, netMargin:0.022, roe:0.035, roa:0.015, roic:0.02 },
    { debtToEquity:0.77, currentRatio:1.12, quickRatio:0.82, interestCoverage:3.8, freeCashFlow:5500000000, totalCash:9000000000, totalDebt:62000000000 },
    { yield:0.059, payoutRatio:2.65, fiveYearGrowthRate:0.03 },
    { rsi14:35, fiftyDaySMA:28.50, twoHundredDaySMA:30.20 },
    { revenueCAGR3Y:-0.18, revenueCAGR5Y:0.04, fcfCAGR3Y:-0.35, fcfCAGR5Y:0.0, analystGrowthEst5Y:0.06 },
    { institutionalPercent:0.72, insiderPercent:0.001, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.075},{name:'State Street',percent:0.042}] },
    { outstanding:5640000000, floatShares:5630000000 },
    genPrices(27.50, -0.15, 0.02, 260)
  );

  window.MOCK_DATA['MRK'] = stock(
    { sector:'Healthcare', industry:'Drug Manufacturers', description:'Merck discovers, develops, manufactures, and markets pharmaceuticals, vaccines, and animal health products.', employees:69000, website:'merck.com' },
    { current:127.00, previousClose:126.50, dayChange:0.50, dayChangePercent:0.40, fiftyTwoWeekHigh:134.63, fiftyTwoWeekLow:99.14, marketCap:322000000000, volume:8200000, avgVolume:9100000 },
    { peRatioTTM:24.8, peRatioForward:13.5, pbRatio:6.5, psRatio:5.2, evToEbitda:15.2, pegRatio:1.2 },
    { grossMargin:0.735, operatingMargin:0.285, netMargin:0.242, roe:0.365, roa:0.125, roic:0.18 },
    { debtToEquity:0.85, currentRatio:1.35, quickRatio:1.05, interestCoverage:16.5, freeCashFlow:12500000000, totalCash:7000000000, totalDebt:35000000000 },
    { yield:0.024, payoutRatio:0.60, fiveYearGrowthRate:0.08 },
    { rsi14:53, fiftyDaySMA:124.00, twoHundredDaySMA:118.00 },
    { revenueCAGR3Y:0.08, revenueCAGR5Y:0.10, fcfCAGR3Y:0.12, fcfCAGR5Y:0.10, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.76, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.088},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.042}] },
    { outstanding:2535000000, floatShares:2530000000 },
    genPrices(127.00, 0.15, 0.015, 260)
  );

  window.MOCK_DATA['ABT'] = stock(
    { sector:'Healthcare', industry:'Medical Devices', description:'Abbott Laboratories discovers, develops, manufactures, and sells healthcare products worldwide.', employees:114000, website:'abbott.com' },
    { current:112.50, previousClose:112.00, dayChange:0.50, dayChangePercent:0.45, fiftyTwoWeekHigh:121.64, fiftyTwoWeekLow:89.67, marketCap:195000000000, volume:5100000, avgVolume:5800000 },
    { peRatioTTM:32.5, peRatioForward:23.8, pbRatio:5.8, psRatio:4.8, evToEbitda:21.5, pegRatio:2.5 },
    { grossMargin:0.542, operatingMargin:0.187, netMargin:0.148, roe:0.178, roa:0.085, roic:0.12 },
    { debtToEquity:0.38, currentRatio:1.68, quickRatio:1.25, interestCoverage:18.2, freeCashFlow:6500000000, totalCash:7000000000, totalDebt:17000000000 },
    { yield:0.020, payoutRatio:0.64, fiveYearGrowthRate:0.09 },
    { rsi14:54, fiftyDaySMA:110.00, twoHundredDaySMA:105.00 },
    { revenueCAGR3Y:0.04, revenueCAGR5Y:0.06, fcfCAGR3Y:0.08, fcfCAGR5Y:0.06, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.76, insiderPercent:0.005, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:1730000000, floatShares:1720000000 },
    genPrices(112.50, 0.12, 0.016, 260)
  );

  // ===== FINANCIALS =====
  window.MOCK_DATA['JPM'] = stock(
    { sector:'Financials', industry:'Banks—Diversified', description:'JPMorgan Chase is the largest US bank providing investment banking, financial services, and asset management.', employees:309000, website:'jpmorganchase.com' },
    { current:198.50, previousClose:197.20, dayChange:1.30, dayChangePercent:0.66, fiftyTwoWeekHigh:205.88, fiftyTwoWeekLow:135.19, marketCap:572000000000, volume:9800000, avgVolume:10500000 },
    { peRatioTTM:11.8, peRatioForward:11.2, pbRatio:1.85, psRatio:3.6, evToEbitda:null, pegRatio:1.8 },
    { grossMargin:null, operatingMargin:0.385, netMargin:0.335, roe:0.165, roa:0.013, roic:null },
    { debtToEquity:1.28, currentRatio:null, quickRatio:null, interestCoverage:null, freeCashFlow:null, totalCash:750000000000, totalDebt:420000000000 },
    { yield:0.022, payoutRatio:0.26, fiveYearGrowthRate:0.06 },
    { rsi14:60, fiftyDaySMA:192.00, twoHundredDaySMA:175.00 },
    { revenueCAGR3Y:0.09, revenueCAGR5Y:0.07, fcfCAGR3Y:null, fcfCAGR5Y:null, analystGrowthEst5Y:0.06 },
    { institutionalPercent:0.72, insiderPercent:0.005, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.045}] },
    { outstanding:2880000000, floatShares:2860000000 },
    genPrices(198.50, 0.28, 0.018, 260)
  );

  window.MOCK_DATA['BAC'] = stock(
    { sector:'Financials', industry:'Banks—Diversified', description:'Bank of America provides banking and financial products and services for consumers and institutions.', employees:213000, website:'bankofamerica.com' },
    { current:37.20, previousClose:37.00, dayChange:0.20, dayChangePercent:0.54, fiftyTwoWeekHigh:38.60, fiftyTwoWeekLow:24.96, marketCap:294000000000, volume:38500000, avgVolume:42000000 },
    { peRatioTTM:12.5, peRatioForward:11.0, pbRatio:1.12, psRatio:3.0, evToEbitda:null, pegRatio:1.9 },
    { grossMargin:null, operatingMargin:0.32, netMargin:0.265, roe:0.092, roa:0.008, roic:null },
    { debtToEquity:1.10, currentRatio:null, quickRatio:null, interestCoverage:null, freeCashFlow:null, totalCash:310000000000, totalDebt:290000000000 },
    { yield:0.026, payoutRatio:0.32, fiveYearGrowthRate:0.08 },
    { rsi14:56, fiftyDaySMA:36.00, twoHundredDaySMA:33.00 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.03, fcfCAGR3Y:null, fcfCAGR5Y:null, analystGrowthEst5Y:0.07 },
    { institutionalPercent:0.70, insiderPercent:0.003, topHolders:[{name:'Berkshire Hathaway',percent:0.13},{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.07}] },
    { outstanding:7900000000, floatShares:7850000000 },
    genPrices(37.20, 0.22, 0.022, 260)
  );

  window.MOCK_DATA['GS'] = stock(
    { sector:'Financials', industry:'Capital Markets', description:'Goldman Sachs provides investment banking, securities, and investment management.', employees:45300, website:'goldmansachs.com' },
    { current:465.00, previousClose:462.50, dayChange:2.50, dayChangePercent:0.54, fiftyTwoWeekHigh:480.20, fiftyTwoWeekLow:297.68, marketCap:156000000000, volume:2800000, avgVolume:3200000 },
    { peRatioTTM:17.5, peRatioForward:13.8, pbRatio:1.45, psRatio:3.2, evToEbitda:null, pegRatio:1.2 },
    { grossMargin:null, operatingMargin:0.35, netMargin:0.22, roe:0.085, roa:0.008, roic:null },
    { debtToEquity:2.45, currentRatio:null, quickRatio:null, interestCoverage:null, freeCashFlow:null, totalCash:260000000000, totalDebt:280000000000 },
    { yield:0.022, payoutRatio:0.38, fiveYearGrowthRate:0.10 },
    { rsi14:62, fiftyDaySMA:445.00, twoHundredDaySMA:390.00 },
    { revenueCAGR3Y:0.06, revenueCAGR5Y:0.08, fcfCAGR3Y:null, fcfCAGR5Y:null, analystGrowthEst5Y:0.10 },
    { institutionalPercent:0.74, insiderPercent:0.012, topHolders:[{name:'Vanguard Group',percent:0.088},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.045}] },
    { outstanding:335000000, floatShares:330000000 },
    genPrices(465.00, 0.35, 0.02, 260)
  );

  window.MOCK_DATA['V'] = stock(
    { sector:'Financials', industry:'Credit Services', description:'Visa operates a global payments technology network.', employees:30000, website:'visa.com' },
    { current:280.00, previousClose:278.50, dayChange:1.50, dayChangePercent:0.54, fiftyTwoWeekHigh:290.96, fiftyTwoWeekLow:227.79, marketCap:558000000000, volume:6800000, avgVolume:7500000 },
    { peRatioTTM:30.5, peRatioForward:26.8, pbRatio:14.2, psRatio:17.0, evToEbitda:24.0, pegRatio:2.2 },
    { grossMargin:0.978, operatingMargin:0.672, netMargin:0.534, roe:0.468, roa:0.172, roic:0.28 },
    { debtToEquity:0.58, currentRatio:1.35, quickRatio:1.28, interestCoverage:28.5, freeCashFlow:18500000000, totalCash:16000000000, totalDebt:20000000000 },
    { yield:0.008, payoutRatio:0.22, fiveYearGrowthRate:0.15 },
    { rsi14:58, fiftyDaySMA:275.00, twoHundredDaySMA:262.00 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.10, fcfCAGR3Y:0.15, fcfCAGR5Y:0.14, analystGrowthEst5Y:0.12 },
    { institutionalPercent:0.94, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.088},{name:'BlackRock',percent:0.075},{name:'T. Rowe Price',percent:0.04}] },
    { outstanding:1993000000, floatShares:1585000000 },
    genPrices(280.00, 0.15, 0.014, 260)
  );

  window.MOCK_DATA['MA'] = stock(
    { sector:'Financials', industry:'Credit Services', description:'Mastercard operates a global payments processing network.', employees:33400, website:'mastercard.com' },
    { current:468.00, previousClose:466.00, dayChange:2.00, dayChangePercent:0.43, fiftyTwoWeekHigh:490.00, fiftyTwoWeekLow:359.77, marketCap:435000000000, volume:3100000, avgVolume:3500000 },
    { peRatioTTM:35.8, peRatioForward:30.0, pbRatio:55.0, psRatio:16.5, evToEbitda:28.0, pegRatio:2.3 },
    { grossMargin:0.968, operatingMargin:0.582, netMargin:0.458, roe:1.72, roa:0.245, roic:0.45 },
    { debtToEquity:null, currentRatio:1.22, quickRatio:1.15, interestCoverage:22.5, freeCashFlow:12000000000, totalCash:8000000000, totalDebt:15000000000 },
    { yield:0.006, payoutRatio:0.20, fiveYearGrowthRate:0.18 },
    { rsi14:56, fiftyDaySMA:462.00, twoHundredDaySMA:430.00 },
    { revenueCAGR3Y:0.14, revenueCAGR5Y:0.11, fcfCAGR3Y:0.18, fcfCAGR5Y:0.16, analystGrowthEst5Y:0.14 },
    { institutionalPercent:0.90, insiderPercent:0.003, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'T. Rowe Price',percent:0.035}] },
    { outstanding:929000000, floatShares:925000000 },
    genPrices(468.00, 0.18, 0.015, 260)
  );

  window.MOCK_DATA['MS'] = stock(
    { sector:'Financials', industry:'Capital Markets', description:'Morgan Stanley provides financial advisory, securities, investment management, and wealth management services.', employees:80000, website:'morganstanley.com' },
    { current:98.50, previousClose:97.80, dayChange:0.70, dayChangePercent:0.72, fiftyTwoWeekHigh:102.50, fiftyTwoWeekLow:72.35, marketCap:161000000000, volume:8200000, avgVolume:9500000 },
    { peRatioTTM:16.8, peRatioForward:14.2, pbRatio:1.85, psRatio:2.8, evToEbitda:null, pegRatio:1.5 },
    { grossMargin:null, operatingMargin:0.30, netMargin:0.185, roe:0.115, roa:0.009, roic:null },
    { debtToEquity:2.78, currentRatio:null, quickRatio:null, interestCoverage:null, freeCashFlow:null, totalCash:80000000000, totalDebt:220000000000 },
    { yield:0.035, payoutRatio:0.58, fiveYearGrowthRate:0.08 },
    { rsi14:59, fiftyDaySMA:94.00, twoHundredDaySMA:86.00 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.07, fcfCAGR3Y:null, fcfCAGR5Y:null, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.82, insiderPercent:0.008, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.042}] },
    { outstanding:1635000000, floatShares:1620000000 },
    genPrices(98.50, 0.22, 0.02, 260)
  );

  // ===== CONSUMER CYCLICAL =====
  window.MOCK_DATA['AMZN'] = stock(
    { sector:'Consumer Cyclical', industry:'Internet Retail', description:'Amazon.com engages in e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.', employees:1540000, website:'amazon.com' },
    { current:185.50, previousClose:184.00, dayChange:1.50, dayChangePercent:0.82, fiftyTwoWeekHigh:191.70, fiftyTwoWeekLow:118.35, marketCap:1910000000000, volume:52400000, avgVolume:56000000 },
    { peRatioTTM:62.5, peRatioForward:38.5, pbRatio:8.5, psRatio:3.2, evToEbitda:21.5, pegRatio:1.6 },
    { grossMargin:0.478, operatingMargin:0.072, netMargin:0.053, roe:0.185, roa:0.058, roic:0.12 },
    { debtToEquity:0.56, currentRatio:1.05, quickRatio:0.85, interestCoverage:8.2, freeCashFlow:35000000000, totalCash:73000000000, totalDebt:67000000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:63, fiftyDaySMA:180.00, twoHundredDaySMA:158.00 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.22, fcfCAGR3Y:0.45, fcfCAGR5Y:0.35, analystGrowthEst5Y:0.18 },
    { institutionalPercent:0.62, insiderPercent:0.092, topHolders:[{name:'Vanguard Group',percent:0.072},{name:'BlackRock',percent:0.062},{name:'State Street',percent:0.035}] },
    { outstanding:10300000000, floatShares:9350000000 },
    genPrices(185.50, 0.42, 0.022, 260)
  );

  window.MOCK_DATA['TSLA'] = stock(
    { sector:'Consumer Cyclical', industry:'Auto Manufacturers', description:'Tesla designs, develops, manufactures, and sells electric vehicles, energy generation, and storage systems.', employees:140000, website:'tesla.com' },
    { current:245.00, previousClose:242.00, dayChange:3.00, dayChangePercent:1.24, fiftyTwoWeekHigh:299.29, fiftyTwoWeekLow:152.37, marketCap:780000000000, volume:112000000, avgVolume:120000000 },
    { peRatioTTM:72.5, peRatioForward:55.0, pbRatio:14.5, psRatio:8.2, evToEbitda:48.0, pegRatio:3.2 },
    { grossMargin:0.184, operatingMargin:0.082, netMargin:0.068, roe:0.215, roa:0.068, roic:0.10 },
    { debtToEquity:0.11, currentRatio:1.73, quickRatio:1.25, interestCoverage:18.5, freeCashFlow:4200000000, totalCash:22000000000, totalDebt:5700000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:58, fiftyDaySMA:235.00, twoHundredDaySMA:220.00 },
    { revenueCAGR3Y:0.28, revenueCAGR5Y:0.45, fcfCAGR3Y:0.15, fcfCAGR5Y:0.35, analystGrowthEst5Y:0.22 },
    { institutionalPercent:0.44, insiderPercent:0.130, topHolders:[{name:'Vanguard Group',percent:0.072},{name:'BlackRock',percent:0.058},{name:'State Street',percent:0.035}] },
    { outstanding:3180000000, floatShares:2770000000 },
    genPrices(245.00, 0.35, 0.04, 260)
  );

  window.MOCK_DATA['HD'] = stock(
    { sector:'Consumer Cyclical', industry:'Home Improvement Retail', description:'Home Depot operates home improvement retail stores.', employees:471600, website:'homedepot.com' },
    { current:345.00, previousClose:343.50, dayChange:1.50, dayChangePercent:0.44, fiftyTwoWeekHigh:396.87, fiftyTwoWeekLow:274.26, marketCap:344000000000, volume:4200000, avgVolume:4800000 },
    { peRatioTTM:23.5, peRatioForward:21.2, pbRatio:null, psRatio:2.2, evToEbitda:16.8, pegRatio:2.3 },
    { grossMargin:0.334, operatingMargin:0.148, netMargin:0.105, roe:null, roa:0.185, roic:0.35 },
    { debtToEquity:null, currentRatio:1.30, quickRatio:0.38, interestCoverage:10.5, freeCashFlow:17000000000, totalCash:2000000000, totalDebt:52000000000 },
    { yield:0.025, payoutRatio:0.58, fiveYearGrowthRate:0.10 },
    { rsi14:44, fiftyDaySMA:350.00, twoHundredDaySMA:340.00 },
    { revenueCAGR3Y:0.04, revenueCAGR5Y:0.07, fcfCAGR3Y:0.06, fcfCAGR5Y:0.10, analystGrowthEst5Y:0.06 },
    { institutionalPercent:0.72, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.075},{name:'State Street',percent:0.04}] },
    { outstanding:997000000, floatShares:992000000 },
    genPrices(345.00, 0.08, 0.018, 260)
  );

  window.MOCK_DATA['NKE'] = stock(
    { sector:'Consumer Cyclical', industry:'Footwear & Accessories', description:'NIKE designs, develops, markets, and sells athletic footwear, apparel, and equipment worldwide.', employees:79400, website:'nike.com' },
    { current:97.50, previousClose:97.00, dayChange:0.50, dayChangePercent:0.52, fiftyTwoWeekHigh:131.31, fiftyTwoWeekLow:88.66, marketCap:148000000000, volume:8500000, avgVolume:9200000 },
    { peRatioTTM:27.8, peRatioForward:24.5, pbRatio:9.2, psRatio:2.8, evToEbitda:19.5, pegRatio:2.4 },
    { grossMargin:0.445, operatingMargin:0.125, netMargin:0.098, roe:0.335, roa:0.138, roic:0.20 },
    { debtToEquity:0.86, currentRatio:2.68, quickRatio:1.62, interestCoverage:15.8, freeCashFlow:5800000000, totalCash:10000000000, totalDebt:12000000000 },
    { yield:0.014, payoutRatio:0.40, fiveYearGrowthRate:0.11 },
    { rsi14:40, fiftyDaySMA:100.00, twoHundredDaySMA:108.00 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.06, fcfCAGR3Y:0.08, fcfCAGR5Y:0.06, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.78, insiderPercent:0.084, topHolders:[{name:'Vanguard Group',percent:0.088},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:1520000000, floatShares:1390000000 },
    genPrices(97.50, -0.05, 0.02, 260)
  );

  window.MOCK_DATA['MCD'] = stock(
    { sector:'Consumer Cyclical', industry:'Restaurants', description:'McDonald\'s operates and franchises restaurants serving food and beverages worldwide.', employees:150000, website:'mcdonalds.com' },
    { current:292.00, previousClose:291.00, dayChange:1.00, dayChangePercent:0.34, fiftyTwoWeekHigh:302.39, fiftyTwoWeekLow:245.73, marketCap:212000000000, volume:3500000, avgVolume:4000000 },
    { peRatioTTM:24.2, peRatioForward:22.5, pbRatio:null, psRatio:8.5, evToEbitda:18.5, pegRatio:2.8 },
    { grossMargin:0.567, operatingMargin:0.442, netMargin:0.332, roe:null, roa:0.155, roic:null },
    { debtToEquity:null, currentRatio:1.15, quickRatio:0.98, interestCoverage:8.2, freeCashFlow:8500000000, totalCash:4000000000, totalDebt:39000000000 },
    { yield:0.023, payoutRatio:0.56, fiveYearGrowthRate:0.08 },
    { rsi14:52, fiftyDaySMA:288.00, twoHundredDaySMA:280.00 },
    { revenueCAGR3Y:0.06, revenueCAGR5Y:0.04, fcfCAGR3Y:0.08, fcfCAGR5Y:0.05, analystGrowthEst5Y:0.07 },
    { institutionalPercent:0.74, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.045}] },
    { outstanding:726000000, floatShares:724000000 },
    genPrices(292.00, 0.08, 0.014, 260)
  );

  // ===== INDUSTRIALS =====
  window.MOCK_DATA['CAT'] = stock(
    { sector:'Industrials', industry:'Farm & Heavy Construction Machinery', description:'Caterpillar manufactures construction and mining equipment, diesel and natural gas engines.', employees:113200, website:'caterpillar.com' },
    { current:340.00, previousClose:338.00, dayChange:2.00, dayChangePercent:0.59, fiftyTwoWeekHigh:367.73, fiftyTwoWeekLow:222.78, marketCap:168000000000, volume:3200000, avgVolume:3800000 },
    { peRatioTTM:16.5, peRatioForward:15.2, pbRatio:9.5, psRatio:2.6, evToEbitda:12.8, pegRatio:1.8 },
    { grossMargin:0.375, operatingMargin:0.214, netMargin:0.158, roe:0.585, roa:0.128, roic:0.22 },
    { debtToEquity:1.85, currentRatio:1.40, quickRatio:0.75, interestCoverage:12.5, freeCashFlow:10500000000, totalCash:7000000000, totalDebt:36000000000 },
    { yield:0.015, payoutRatio:0.25, fiveYearGrowthRate:0.08 },
    { rsi14:55, fiftyDaySMA:330.00, twoHundredDaySMA:300.00 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.08, fcfCAGR3Y:0.18, fcfCAGR5Y:0.12, analystGrowthEst5Y:0.07 },
    { institutionalPercent:0.71, insiderPercent:0.003, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.055}] },
    { outstanding:494000000, floatShares:490000000 },
    genPrices(340.00, 0.30, 0.02, 260)
  );

  window.MOCK_DATA['GE'] = stock(
    { sector:'Industrials', industry:'Specialty Industrial Machinery', description:'GE Aerospace designs and produces commercial and military aircraft engines, integrated systems.', employees:52000, website:'geaerospace.com' },
    { current:158.00, previousClose:156.50, dayChange:1.50, dayChangePercent:0.96, fiftyTwoWeekHigh:168.42, fiftyTwoWeekLow:87.26, marketCap:172000000000, volume:6500000, avgVolume:7200000 },
    { peRatioTTM:25.5, peRatioForward:32.0, pbRatio:9.2, psRatio:4.8, evToEbitda:22.0, pegRatio:1.8 },
    { grossMargin:0.285, operatingMargin:0.168, netMargin:0.415, roe:0.35, roa:0.065, roic:0.12 },
    { debtToEquity:1.12, currentRatio:1.28, quickRatio:0.95, interestCoverage:8.5, freeCashFlow:5200000000, totalCash:16000000000, totalDebt:22000000000 },
    { yield:0.006, payoutRatio:0.15, fiveYearGrowthRate:0.10 },
    { rsi14:62, fiftyDaySMA:148.00, twoHundredDaySMA:128.00 },
    { revenueCAGR3Y:0.08, revenueCAGR5Y:0.02, fcfCAGR3Y:0.25, fcfCAGR5Y:0.15, analystGrowthEst5Y:0.12 },
    { institutionalPercent:0.75, insiderPercent:0.005, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:1088000000, floatShares:1082000000 },
    genPrices(158.00, 0.55, 0.022, 260)
  );

  window.MOCK_DATA['HON'] = stock(
    { sector:'Industrials', industry:'Conglomerates', description:'Honeywell International operates as a diversified technology and manufacturing company.', employees:97000, website:'honeywell.com' },
    { current:205.00, previousClose:204.00, dayChange:1.00, dayChangePercent:0.49, fiftyTwoWeekHigh:221.02, fiftyTwoWeekLow:174.80, marketCap:135000000000, volume:3800000, avgVolume:4200000 },
    { peRatioTTM:22.8, peRatioForward:20.5, pbRatio:7.8, psRatio:3.7, evToEbitda:15.5, pegRatio:2.5 },
    { grossMargin:0.372, operatingMargin:0.215, netMargin:0.155, roe:0.345, roa:0.085, roic:0.14 },
    { debtToEquity:1.15, currentRatio:1.35, quickRatio:1.02, interestCoverage:10.2, freeCashFlow:5500000000, totalCash:8500000000, totalDebt:24000000000 },
    { yield:0.022, payoutRatio:0.50, fiveYearGrowthRate:0.05 },
    { rsi14:48, fiftyDaySMA:208.00, twoHundredDaySMA:202.00 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.03, fcfCAGR3Y:0.06, fcfCAGR5Y:0.05, analystGrowthEst5Y:0.07 },
    { institutionalPercent:0.78, insiderPercent:0.004, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.075},{name:'State Street',percent:0.045}] },
    { outstanding:658000000, floatShares:654000000 },
    genPrices(205.00, 0.05, 0.016, 260)
  );

  window.MOCK_DATA['UPS'] = stock(
    { sector:'Industrials', industry:'Integrated Freight & Logistics', description:'United Parcel Service provides letter and package delivery, transportation, and logistics services.', employees:404700, website:'ups.com' },
    { current:148.00, previousClose:147.50, dayChange:0.50, dayChangePercent:0.34, fiftyTwoWeekHigh:193.79, fiftyTwoWeekLow:138.81, marketCap:127000000000, volume:3200000, avgVolume:3600000 },
    { peRatioTTM:19.2, peRatioForward:16.5, pbRatio:9.5, psRatio:1.4, evToEbitda:12.5, pegRatio:2.8 },
    { grossMargin:0.232, operatingMargin:0.098, netMargin:0.078, roe:0.48, roa:0.085, roic:0.18 },
    { debtToEquity:2.20, currentRatio:1.12, quickRatio:1.05, interestCoverage:7.5, freeCashFlow:6200000000, totalCash:5500000000, totalDebt:26000000000 },
    { yield:0.044, payoutRatio:0.84, fiveYearGrowthRate:0.10 },
    { rsi14:38, fiftyDaySMA:152.00, twoHundredDaySMA:162.00 },
    { revenueCAGR3Y:-0.02, revenueCAGR5Y:0.04, fcfCAGR3Y:0.05, fcfCAGR5Y:0.08, analystGrowthEst5Y:0.05 },
    { institutionalPercent:0.62, insiderPercent:0.005, topHolders:[{name:'Vanguard Group',percent:0.088},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:858000000, floatShares:853000000 },
    genPrices(148.00, -0.08, 0.018, 260)
  );

  window.MOCK_DATA['BA'] = stock(
    { sector:'Industrials', industry:'Aerospace & Defense', description:'Boeing designs, manufactures, and sells commercial jetliners, defense products, and space systems.', employees:170000, website:'boeing.com' },
    { current:208.00, previousClose:206.50, dayChange:1.50, dayChangePercent:0.73, fiftyTwoWeekHigh:267.54, fiftyTwoWeekLow:159.72, marketCap:126000000000, volume:6200000, avgVolume:7200000 },
    { peRatioTTM:null, peRatioForward:null, pbRatio:null, psRatio:1.6, evToEbitda:null, pegRatio:null },
    { grossMargin:0.105, operatingMargin:-0.025, netMargin:-0.032, roe:null, roa:-0.018, roic:-0.02 },
    { debtToEquity:null, currentRatio:1.18, quickRatio:0.32, interestCoverage:-0.5, freeCashFlow:-3500000000, totalCash:15000000000, totalDebt:53000000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:42, fiftyDaySMA:215.00, twoHundredDaySMA:225.00 },
    { revenueCAGR3Y:0.15, revenueCAGR5Y:-0.04, fcfCAGR3Y:null, fcfCAGR5Y:null, analystGrowthEst5Y:0.15 },
    { institutionalPercent:0.65, insiderPercent:0.003, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'Newport Trust',percent:0.055}] },
    { outstanding:606000000, floatShares:600000000 },
    genPrices(208.00, -0.10, 0.028, 260)
  );

  // ===== COMMUNICATION / STREAMING =====
  window.MOCK_DATA['NFLX'] = stock(
    { sector:'Communication Services', industry:'Entertainment', description:'Netflix provides streaming entertainment services with TV series, films, and games.', employees:13000, website:'netflix.com' },
    { current:628.00, previousClose:625.00, dayChange:3.00, dayChangePercent:0.48, fiftyTwoWeekHigh:639.00, fiftyTwoWeekLow:344.73, marketCap:275000000000, volume:4500000, avgVolume:5200000 },
    { peRatioTTM:48.5, peRatioForward:32.0, pbRatio:13.8, psRatio:8.2, evToEbitda:28.5, pegRatio:1.6 },
    { grossMargin:0.432, operatingMargin:0.225, netMargin:0.185, roe:0.282, roa:0.115, roic:0.18 },
    { debtToEquity:0.62, currentRatio:1.12, quickRatio:1.08, interestCoverage:8.5, freeCashFlow:6800000000, totalCash:8500000000, totalDebt:14000000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:65, fiftyDaySMA:600.00, twoHundredDaySMA:510.00 },
    { revenueCAGR3Y:0.10, revenueCAGR5Y:0.14, fcfCAGR3Y:0.85, fcfCAGR5Y:0.60, analystGrowthEst5Y:0.14 },
    { institutionalPercent:0.82, insiderPercent:0.016, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'Capital Group',percent:0.05}] },
    { outstanding:437000000, floatShares:430000000 },
    genPrices(628.00, 0.58, 0.025, 260)
  );

  window.MOCK_DATA['DIS'] = stock(
    { sector:'Communication Services', industry:'Entertainment', description:'Walt Disney operates theme parks, media networks, studio entertainment, and streaming (Disney+).', employees:220000, website:'thewaltdisneycompany.com' },
    { current:114.00, previousClose:113.50, dayChange:0.50, dayChangePercent:0.44, fiftyTwoWeekHigh:123.74, fiftyTwoWeekLow:78.73, marketCap:208000000000, volume:10200000, avgVolume:11500000 },
    { peRatioTTM:72.5, peRatioForward:20.5, pbRatio:2.1, psRatio:2.4, evToEbitda:16.5, pegRatio:1.5 },
    { grossMargin:0.348, operatingMargin:0.115, netMargin:0.028, roe:0.032, roa:0.015, roic:0.04 },
    { debtToEquity:0.48, currentRatio:1.02, quickRatio:0.85, interestCoverage:4.5, freeCashFlow:6500000000, totalCash:14000000000, totalDebt:48000000000 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:52, fiftyDaySMA:112.00, twoHundredDaySMA:100.00 },
    { revenueCAGR3Y:0.06, revenueCAGR5Y:0.02, fcfCAGR3Y:0.25, fcfCAGR5Y:0.10, analystGrowthEst5Y:0.10 },
    { institutionalPercent:0.68, insiderPercent:0.008, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.07},{name:'State Street',percent:0.04}] },
    { outstanding:1825000000, floatShares:1810000000 },
    genPrices(114.00, 0.15, 0.022, 260)
  );

  window.MOCK_DATA['T'] = stock(
    { sector:'Communication Services', industry:'Telecom Services', description:'AT&T provides telecommunications, media, and technology services.', employees:160700, website:'att.com' },
    { current:17.20, previousClose:17.10, dayChange:0.10, dayChangePercent:0.58, fiftyTwoWeekHigh:21.84, fiftyTwoWeekLow:13.43, marketCap:123000000000, volume:42000000, avgVolume:46000000 },
    { peRatioTTM:8.5, peRatioForward:7.8, pbRatio:1.05, psRatio:1.0, evToEbitda:7.0, pegRatio:2.1 },
    { grossMargin:0.542, operatingMargin:0.195, netMargin:0.118, roe:0.125, roa:0.032, roic:0.05 },
    { debtToEquity:1.42, currentRatio:0.58, quickRatio:0.52, interestCoverage:3.2, freeCashFlow:16000000000, totalCash:4000000000, totalDebt:137000000000 },
    { yield:0.065, payoutRatio:0.55, fiveYearGrowthRate:0.02 },
    { rsi14:44, fiftyDaySMA:17.50, twoHundredDaySMA:16.80 },
    { revenueCAGR3Y:-0.02, revenueCAGR5Y:-0.04, fcfCAGR3Y:0.05, fcfCAGR5Y:0.02, analystGrowthEst5Y:0.02 },
    { institutionalPercent:0.58, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.075},{name:'State Street',percent:0.045}] },
    { outstanding:7150000000, floatShares:7140000000 },
    genPrices(17.20, -0.10, 0.02, 260)
  );

  // ===== CONSUMER DEFENSIVE =====
  window.MOCK_DATA['WMT'] = stock(
    { sector:'Consumer Defensive', industry:'Discount Stores', description:'Walmart operates retail stores and e-commerce websites worldwide.', employees:2100000, website:'walmart.com' },
    { current:165.00, previousClose:164.20, dayChange:0.80, dayChangePercent:0.49, fiftyTwoWeekHigh:170.71, fiftyTwoWeekLow:138.20, marketCap:444000000000, volume:8200000, avgVolume:9000000 },
    { peRatioTTM:28.8, peRatioForward:25.0, pbRatio:6.2, psRatio:0.7, evToEbitda:15.5, pegRatio:3.5 },
    { grossMargin:0.245, operatingMargin:0.042, netMargin:0.025, roe:0.215, roa:0.065, roic:0.12 },
    { debtToEquity:0.68, currentRatio:0.82, quickRatio:0.22, interestCoverage:9.5, freeCashFlow:12000000000, totalCash:9000000000, totalDebt:45000000000 },
    { yield:0.014, payoutRatio:0.40, fiveYearGrowthRate:0.02 },
    { rsi14:60, fiftyDaySMA:162.00, twoHundredDaySMA:155.00 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.04, fcfCAGR3Y:0.08, fcfCAGR5Y:0.06, analystGrowthEst5Y:0.05 },
    { institutionalPercent:0.31, insiderPercent:0.465, topHolders:[{name:'Walton Family',percent:0.465},{name:'Vanguard Group',percent:0.055},{name:'BlackRock',percent:0.045}] },
    { outstanding:2690000000, floatShares:1440000000 },
    genPrices(165.00, 0.12, 0.012, 260)
  );

  window.MOCK_DATA['COST'] = stock(
    { sector:'Consumer Defensive', industry:'Discount Stores', description:'Costco operates membership-only big-box retail stores.', employees:316000, website:'costco.com' },
    { current:725.00, previousClose:722.50, dayChange:2.50, dayChangePercent:0.35, fiftyTwoWeekHigh:760.00, fiftyTwoWeekLow:474.35, marketCap:322000000000, volume:2400000, avgVolume:2800000 },
    { peRatioTTM:48.5, peRatioForward:42.0, pbRatio:14.5, psRatio:1.3, evToEbitda:30.0, pegRatio:4.5 },
    { grossMargin:0.127, operatingMargin:0.036, netMargin:0.027, roe:0.30, roa:0.098, roic:0.18 },
    { debtToEquity:0.32, currentRatio:1.05, quickRatio:0.58, interestCoverage:38, freeCashFlow:6000000000, totalCash:13000000000, totalDebt:7000000000 },
    { yield:0.006, payoutRatio:0.28, fiveYearGrowthRate:0.12 },
    { rsi14:64, fiftyDaySMA:710.00, twoHundredDaySMA:640.00 },
    { revenueCAGR3Y:0.10, revenueCAGR5Y:0.12, fcfCAGR3Y:0.15, fcfCAGR5Y:0.12, analystGrowthEst5Y:0.09 },
    { institutionalPercent:0.71, insiderPercent:0.004, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:444000000, floatShares:442000000 },
    genPrices(725.00, 0.35, 0.015, 260)
  );

  window.MOCK_DATA['PG'] = stock(
    { sector:'Consumer Defensive', industry:'Household & Personal Products', description:'Procter & Gamble manufactures and markets consumer packaged goods worldwide.', employees:107000, website:'us.pg.com' },
    { current:162.00, previousClose:161.50, dayChange:0.50, dayChangePercent:0.31, fiftyTwoWeekHigh:165.35, fiftyTwoWeekLow:141.45, marketCap:382000000000, volume:6200000, avgVolume:6800000 },
    { peRatioTTM:26.5, peRatioForward:24.0, pbRatio:7.8, psRatio:4.6, evToEbitda:19.5, pegRatio:3.8 },
    { grossMargin:0.515, operatingMargin:0.232, netMargin:0.185, roe:0.295, roa:0.115, roic:0.17 },
    { debtToEquity:0.62, currentRatio:0.72, quickRatio:0.48, interestCoverage:22.5, freeCashFlow:16000000000, totalCash:8000000000, totalDebt:34000000000 },
    { yield:0.024, payoutRatio:0.63, fiveYearGrowthRate:0.05 },
    { rsi14:56, fiftyDaySMA:160.00, twoHundredDaySMA:155.00 },
    { revenueCAGR3Y:0.04, revenueCAGR5Y:0.05, fcfCAGR3Y:0.06, fcfCAGR5Y:0.05, analystGrowthEst5Y:0.05 },
    { institutionalPercent:0.64, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.04}] },
    { outstanding:2358000000, floatShares:2350000000 },
    genPrices(162.00, 0.06, 0.012, 260)
  );

  window.MOCK_DATA['KO'] = stock(
    { sector:'Consumer Defensive', industry:'Beverages—Non-Alcoholic', description:'Coca-Cola manufactures, markets, and distributes nonalcoholic beverages worldwide.', employees:79000, website:'coca-colacompany.com' },
    { current:60.50, previousClose:60.20, dayChange:0.30, dayChangePercent:0.50, fiftyTwoWeekHigh:64.99, fiftyTwoWeekLow:51.55, marketCap:262000000000, volume:12500000, avgVolume:13800000 },
    { peRatioTTM:24.5, peRatioForward:22.0, pbRatio:10.5, psRatio:5.7, evToEbitda:19.8, pegRatio:3.5 },
    { grossMargin:0.598, operatingMargin:0.275, netMargin:0.222, roe:0.428, roa:0.098, roic:0.14 },
    { debtToEquity:1.68, currentRatio:1.14, quickRatio:0.78, interestCoverage:8.5, freeCashFlow:9500000000, totalCash:13000000000, totalDebt:42000000000 },
    { yield:0.031, payoutRatio:0.76, fiveYearGrowthRate:0.03 },
    { rsi14:48, fiftyDaySMA:61.00, twoHundredDaySMA:59.50 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.06, fcfCAGR3Y:0.04, fcfCAGR5Y:0.05, analystGrowthEst5Y:0.05 },
    { institutionalPercent:0.68, insiderPercent:0.094, topHolders:[{name:'Berkshire Hathaway',percent:0.093},{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.068}] },
    { outstanding:4330000000, floatShares:3920000000 },
    genPrices(60.50, 0.04, 0.012, 260)
  );

  // ===== ENERGY =====
  window.MOCK_DATA['XOM'] = stock(
    { sector:'Energy', industry:'Oil & Gas Integrated', description:'Exxon Mobil explores for and produces crude oil and natural gas.', employees:62000, website:'exxonmobil.com' },
    { current:108.00, previousClose:107.50, dayChange:0.50, dayChangePercent:0.47, fiftyTwoWeekHigh:120.70, fiftyTwoWeekLow:95.77, marketCap:435000000000, volume:15200000, avgVolume:16800000 },
    { peRatioTTM:12.5, peRatioForward:12.0, pbRatio:2.1, psRatio:1.3, evToEbitda:6.5, pegRatio:3.5 },
    { grossMargin:0.325, operatingMargin:0.155, netMargin:0.105, roe:0.172, roa:0.078, roic:0.12 },
    { debtToEquity:0.22, currentRatio:1.38, quickRatio:0.95, interestCoverage:35, freeCashFlow:36000000000, totalCash:31000000000, totalDebt:47000000000 },
    { yield:0.034, payoutRatio:0.42, fiveYearGrowthRate:0.06 },
    { rsi14:50, fiftyDaySMA:110.00, twoHundredDaySMA:108.00 },
    { revenueCAGR3Y:0.08, revenueCAGR5Y:0.10, fcfCAGR3Y:0.12, fcfCAGR5Y:0.15, analystGrowthEst5Y:0.03 },
    { institutionalPercent:0.62, insiderPercent:0.001, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.055}] },
    { outstanding:4025000000, floatShares:4020000000 },
    genPrices(108.00, 0.05, 0.016, 260)
  );

  window.MOCK_DATA['CVX'] = stock(
    { sector:'Energy', industry:'Oil & Gas Integrated', description:'Chevron engages in integrated energy and chemicals operations worldwide.', employees:43846, website:'chevron.com' },
    { current:155.00, previousClose:154.50, dayChange:0.50, dayChangePercent:0.32, fiftyTwoWeekHigh:171.70, fiftyTwoWeekLow:139.62, marketCap:293000000000, volume:7800000, avgVolume:8500000 },
    { peRatioTTM:13.2, peRatioForward:12.5, pbRatio:1.9, psRatio:1.5, evToEbitda:6.8, pegRatio:4.0 },
    { grossMargin:0.412, operatingMargin:0.175, netMargin:0.118, roe:0.145, roa:0.068, roic:0.10 },
    { debtToEquity:0.15, currentRatio:1.35, quickRatio:1.05, interestCoverage:52, freeCashFlow:21000000000, totalCash:17000000000, totalDebt:27000000000 },
    { yield:0.040, payoutRatio:0.52, fiveYearGrowthRate:0.04 },
    { rsi14:46, fiftyDaySMA:158.00, twoHundredDaySMA:155.00 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.08, fcfCAGR3Y:0.10, fcfCAGR5Y:0.12, analystGrowthEst5Y:0.02 },
    { institutionalPercent:0.73, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.052}] },
    { outstanding:1890000000, floatShares:1885000000 },
    genPrices(155.00, 0.02, 0.016, 260)
  );

  window.MOCK_DATA['COP'] = stock(
    { sector:'Energy', industry:'Oil & Gas E&P', description:'ConocoPhillips explores for, produces, transports, and markets crude oil and natural gas.', employees:9900, website:'conocophillips.com' },
    { current:118.00, previousClose:117.50, dayChange:0.50, dayChangePercent:0.43, fiftyTwoWeekHigh:132.56, fiftyTwoWeekLow:95.60, marketCap:140000000000, volume:5800000, avgVolume:6500000 },
    { peRatioTTM:12.8, peRatioForward:11.5, pbRatio:2.8, psRatio:2.4, evToEbitda:5.5, pegRatio:2.5 },
    { grossMargin:0.548, operatingMargin:0.345, netMargin:0.225, roe:0.225, roa:0.118, roic:0.16 },
    { debtToEquity:0.38, currentRatio:1.42, quickRatio:1.15, interestCoverage:28, freeCashFlow:12000000000, totalCash:7000000000, totalDebt:21000000000 },
    { yield:0.028, payoutRatio:0.35, fiveYearGrowthRate:0.05 },
    { rsi14:48, fiftyDaySMA:120.00, twoHundredDaySMA:118.00 },
    { revenueCAGR3Y:0.10, revenueCAGR5Y:0.15, fcfCAGR3Y:0.15, fcfCAGR5Y:0.18, analystGrowthEst5Y:0.04 },
    { institutionalPercent:0.80, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.092},{name:'BlackRock',percent:0.075},{name:'State Street',percent:0.05}] },
    { outstanding:1186000000, floatShares:1180000000 },
    genPrices(118.00, 0.08, 0.02, 260)
  );

  window.MOCK_DATA['SLB'] = stock(
    { sector:'Energy', industry:'Oil & Gas Equipment & Services', description:'Schlumberger provides technology and services for oil and gas exploration and production.', employees:99000, website:'slb.com' },
    { current:48.50, previousClose:48.20, dayChange:0.30, dayChangePercent:0.62, fiftyTwoWeekHigh:62.13, fiftyTwoWeekLow:42.52, marketCap:69000000000, volume:11500000, avgVolume:12800000 },
    { peRatioTTM:15.5, peRatioForward:13.0, pbRatio:3.2, psRatio:2.0, evToEbitda:8.5, pegRatio:1.5 },
    { grossMargin:0.212, operatingMargin:0.165, netMargin:0.118, roe:0.218, roa:0.068, roic:0.10 },
    { debtToEquity:0.52, currentRatio:1.42, quickRatio:1.05, interestCoverage:9.2, freeCashFlow:4200000000, totalCash:3200000000, totalDebt:13000000000 },
    { yield:0.021, payoutRatio:0.32, fiveYearGrowthRate:0.08 },
    { rsi14:42, fiftyDaySMA:50.00, twoHundredDaySMA:52.00 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.05, fcfCAGR3Y:0.22, fcfCAGR5Y:0.10, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.78, insiderPercent:0.003, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.042}] },
    { outstanding:1422000000, floatShares:1418000000 },
    genPrices(48.50, -0.05, 0.022, 260)
  );

  // ===== UTILITIES =====
  window.MOCK_DATA['NEE'] = stock(
    { sector:'Utilities', industry:'Utilities—Regulated Electric', description:'NextEra Energy generates, transmits, and distributes electric power, including renewables.', employees:15700, website:'nexteraenergy.com' },
    { current:72.00, previousClose:71.50, dayChange:0.50, dayChangePercent:0.70, fiftyTwoWeekHigh:79.58, fiftyTwoWeekLow:51.52, marketCap:148000000000, volume:12500000, avgVolume:14000000 },
    { peRatioTTM:22.5, peRatioForward:20.0, pbRatio:3.2, psRatio:5.5, evToEbitda:17.5, pegRatio:2.8 },
    { grossMargin:0.525, operatingMargin:0.285, netMargin:0.245, roe:0.142, roa:0.038, roic:0.05 },
    { debtToEquity:1.35, currentRatio:0.55, quickRatio:0.42, interestCoverage:3.8, freeCashFlow:-4000000000, totalCash:2000000000, totalDebt:75000000000 },
    { yield:0.028, payoutRatio:0.63, fiveYearGrowthRate:0.10 },
    { rsi14:54, fiftyDaySMA:70.00, twoHundredDaySMA:65.00 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.10, fcfCAGR3Y:-0.05, fcfCAGR5Y:-0.02, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.79, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.075},{name:'State Street',percent:0.045}] },
    { outstanding:2055000000, floatShares:2050000000 },
    genPrices(72.00, 0.10, 0.016, 260)
  );

  window.MOCK_DATA['DUK'] = stock(
    { sector:'Utilities', industry:'Utilities—Regulated Electric', description:'Duke Energy generates, transmits, distributes, and sells electric energy in the US.', employees:27600, website:'duke-energy.com' },
    { current:100.00, previousClose:99.50, dayChange:0.50, dayChangePercent:0.50, fiftyTwoWeekHigh:108.31, fiftyTwoWeekLow:83.06, marketCap:77000000000, volume:3200000, avgVolume:3800000 },
    { peRatioTTM:18.5, peRatioForward:16.8, pbRatio:1.8, psRatio:2.7, evToEbitda:12.8, pegRatio:3.0 },
    { grossMargin:0.445, operatingMargin:0.225, netMargin:0.148, roe:0.095, roa:0.025, roic:0.035 },
    { debtToEquity:1.52, currentRatio:0.62, quickRatio:0.38, interestCoverage:2.5, freeCashFlow:-3000000000, totalCash:500000000, totalDebt:78000000000 },
    { yield:0.041, payoutRatio:0.76, fiveYearGrowthRate:0.02 },
    { rsi14:50, fiftyDaySMA:98.00, twoHundredDaySMA:95.00 },
    { revenueCAGR3Y:0.04, revenueCAGR5Y:0.03, fcfCAGR3Y:-0.08, fcfCAGR5Y:-0.05, analystGrowthEst5Y:0.05 },
    { institutionalPercent:0.66, insiderPercent:0.001, topHolders:[{name:'Vanguard Group',percent:0.09},{name:'BlackRock',percent:0.074},{name:'State Street',percent:0.048}] },
    { outstanding:770000000, floatShares:768000000 },
    genPrices(100.00, 0.05, 0.012, 260)
  );

  // ===== REAL ESTATE =====
  window.MOCK_DATA['AMT'] = stock(
    { sector:'Real Estate', industry:'REIT—Specialty', description:'American Tower owns and operates wireless and broadcast communications infrastructure worldwide.', employees:6600, website:'americantower.com' },
    { current:205.00, previousClose:204.00, dayChange:1.00, dayChangePercent:0.49, fiftyTwoWeekHigh:236.29, fiftyTwoWeekLow:155.72, marketCap:96000000000, volume:2200000, avgVolume:2600000 },
    { peRatioTTM:42.5, peRatioForward:35.0, pbRatio:15.0, psRatio:8.5, evToEbitda:22.5, pegRatio:2.2 },
    { grossMargin:0.725, operatingMargin:0.285, netMargin:0.195, roe:0.35, roa:0.048, roic:0.06 },
    { debtToEquity:null, currentRatio:0.55, quickRatio:0.48, interestCoverage:2.8, freeCashFlow:5200000000, totalCash:2500000000, totalDebt:40000000000 },
    { yield:0.031, payoutRatio:1.32, fiveYearGrowthRate:0.15 },
    { rsi14:45, fiftyDaySMA:210.00, twoHundredDaySMA:200.00 },
    { revenueCAGR3Y:0.05, revenueCAGR5Y:0.08, fcfCAGR3Y:0.06, fcfCAGR5Y:0.10, analystGrowthEst5Y:0.06 },
    { institutionalPercent:0.91, insiderPercent:0.003, topHolders:[{name:'Vanguard Group',percent:0.12},{name:'BlackRock',percent:0.09},{name:'State Street',percent:0.05}] },
    { outstanding:468000000, floatShares:466000000 },
    genPrices(205.00, 0.05, 0.018, 260)
  );

  window.MOCK_DATA['PLD'] = stock(
    { sector:'Real Estate', industry:'REIT—Industrial', description:'Prologis develops and manages logistics facilities worldwide.', employees:2300, website:'prologis.com' },
    { current:125.00, previousClose:124.50, dayChange:0.50, dayChangePercent:0.40, fiftyTwoWeekHigh:140.32, fiftyTwoWeekLow:100.38, marketCap:116000000000, volume:4200000, avgVolume:4800000 },
    { peRatioTTM:38.5, peRatioForward:42.0, pbRatio:2.5, psRatio:14.2, evToEbitda:25.5, pegRatio:4.0 },
    { grossMargin:0.752, operatingMargin:0.408, netMargin:0.385, roe:0.065, roa:0.032, roic:0.04 },
    { debtToEquity:0.48, currentRatio:0.42, quickRatio:0.35, interestCoverage:4.5, freeCashFlow:4000000000, totalCash:600000000, totalDebt:28000000000 },
    { yield:0.030, payoutRatio:1.15, fiveYearGrowthRate:0.10 },
    { rsi14:48, fiftyDaySMA:128.00, twoHundredDaySMA:122.00 },
    { revenueCAGR3Y:0.18, revenueCAGR5Y:0.15, fcfCAGR3Y:0.12, fcfCAGR5Y:0.14, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.92, insiderPercent:0.005, topHolders:[{name:'Vanguard Group',percent:0.14},{name:'BlackRock',percent:0.10},{name:'State Street',percent:0.055}] },
    { outstanding:928000000, floatShares:922000000 },
    genPrices(125.00, 0.08, 0.016, 260)
  );

  // ===== BASIC MATERIALS =====
  window.MOCK_DATA['LIN'] = stock(
    { sector:'Basic Materials', industry:'Specialty Chemicals', description:'Linde produces and distributes atmospheric and process gases worldwide.', employees:66000, website:'linde.com' },
    { current:448.00, previousClose:446.50, dayChange:1.50, dayChangePercent:0.34, fiftyTwoWeekHigh:468.80, fiftyTwoWeekLow:365.08, marketCap:217000000000, volume:2000000, avgVolume:2400000 },
    { peRatioTTM:32.5, peRatioForward:28.0, pbRatio:5.5, psRatio:6.5, evToEbitda:20.5, pegRatio:3.2 },
    { grossMargin:0.475, operatingMargin:0.255, netMargin:0.198, roe:0.168, roa:0.068, roic:0.10 },
    { debtToEquity:0.28, currentRatio:0.82, quickRatio:0.65, interestCoverage:18, freeCashFlow:7500000000, totalCash:5000000000, totalDebt:20000000000 },
    { yield:0.013, payoutRatio:0.42, fiveYearGrowthRate:0.08 },
    { rsi14:55, fiftyDaySMA:440.00, twoHundredDaySMA:420.00 },
    { revenueCAGR3Y:0.06, revenueCAGR5Y:0.05, fcfCAGR3Y:0.08, fcfCAGR5Y:0.07, analystGrowthEst5Y:0.08 },
    { institutionalPercent:0.80, insiderPercent:0.002, topHolders:[{name:'Vanguard Group',percent:0.085},{name:'BlackRock',percent:0.072},{name:'State Street',percent:0.04}] },
    { outstanding:484000000, floatShares:482000000 },
    genPrices(448.00, 0.12, 0.014, 260)
  );

  // ===== ADDITIONAL POPULAR STOCKS =====
  window.MOCK_DATA['ORCL'] = stock(
    { sector:'Technology', industry:'Software—Infrastructure', description:'Oracle provides cloud and on-premises database and enterprise software and services.', employees:164000, website:'oracle.com' },
    { current:178.00, previousClose:176.80, dayChange:1.20, dayChangePercent:0.68, fiftyTwoWeekHigh:185.00, fiftyTwoWeekLow:99.26, marketCap:490000000000, volume:8500000, avgVolume:9200000 },
    { peRatioTTM:38.5, peRatioForward:24.0, pbRatio:42.0, psRatio:9.2, evToEbitda:22.5, pegRatio:1.8 },
    { grossMargin:0.718, operatingMargin:0.305, netMargin:0.175, roe:1.25, roa:0.068, roic:0.12 },
    { debtToEquity:8.5, currentRatio:0.72, quickRatio:0.55, interestCoverage:4.5, freeCashFlow:11500000000, totalCash:11000000000, totalDebt:86000000000 },
    { yield:0.012, payoutRatio:0.45, fiveYearGrowthRate:0.06 },
    { rsi14:58, fiftyDaySMA:170.00, twoHundredDaySMA:140.00 },
    { revenueCAGR3Y:0.12, revenueCAGR5Y:0.06, fcfCAGR3Y:0.08, fcfCAGR5Y:0.05, analystGrowthEst5Y:0.12 },
    { institutionalPercent:0.46, insiderPercent:0.42, topHolders:[{name:'Larry Ellison',percent:0.42},{name:'Vanguard Group',percent:0.042},{name:'BlackRock',percent:0.035}] },
    { outstanding:2750000000, floatShares:1600000000 },
    genPrices(178.00, 0.55, 0.022, 260)
  );

  window.MOCK_DATA['PLTR'] = stock(
    { sector:'Technology', industry:'Software—Infrastructure', description:'Palantir Technologies builds and deploys software platforms for intelligence, defense, and commercial applications.', employees:3700, website:'palantir.com' },
    { current:26.50, previousClose:26.00, dayChange:0.50, dayChangePercent:1.92, fiftyTwoWeekHigh:27.50, fiftyTwoWeekLow:13.68, marketCap:58000000000, volume:65000000, avgVolume:70000000 },
    { peRatioTTM:265.0, peRatioForward:68.0, pbRatio:14.5, psRatio:25.0, evToEbitda:175.0, pegRatio:5.5 },
    { grossMargin:0.812, operatingMargin:0.065, netMargin:0.042, roe:0.055, roa:0.038, roic:0.04 },
    { debtToEquity:0.0, currentRatio:5.45, quickRatio:5.20, interestCoverage:null, freeCashFlow:700000000, totalCash:3800000000, totalDebt:0 },
    { yield:0.0, payoutRatio:0.0, fiveYearGrowthRate:null },
    { rsi14:72, fiftyDaySMA:24.00, twoHundredDaySMA:19.00 },
    { revenueCAGR3Y:0.22, revenueCAGR5Y:0.28, fcfCAGR3Y:0.45, fcfCAGR5Y:0.35, analystGrowthEst5Y:0.22 },
    { institutionalPercent:0.38, insiderPercent:0.098, topHolders:[{name:'Vanguard Group',percent:0.068},{name:'BlackRock',percent:0.055},{name:'State Street',percent:0.028}] },
    { outstanding:2190000000, floatShares:1975000000 },
    genPrices(26.50, 0.65, 0.04, 260)
  );

  console.log(`✅ Mock Data loaded: ${Object.keys(window.MOCK_DATA).length} stocks with full financials`);
})();
