const { query } = require('../config/database');
const polygonService = require('../services/polygonService');

// Get dashboard overview for a user
exports.getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the requesting user has access to this dashboard
    if (req.dbUser.id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user portfolio and holdings
    const portfolioResult = await query(
      'SELECT p.id, p.name, ph.symbol, ph.shares, ph.entry_price, ph.entry_date FROM portfolios p JOIN portfolio_holdings ph ON p.id = ph.portfolio_id WHERE p.user_id = $1 AND p.is_active = true',
      [userId]
    );

    if (portfolioResult.rows.length === 0) {
      return res.status(200).json({ 
        portfolio: [],
        totalValue: 0,
        totalPnL: 0
      });
    }

    // Fetch live prices of the stocks from polygon api
    const results = await Promise.all(
      portfolioResult.rows.map(async (holding) => {
        try {
          const history = await polygonService.getStockHistory(holding.symbol, "1d");
          const lastClose = history.results?.[history.results.length - 1]?.c || holding.entry_price;

          return {
            id: holding.id,
            ticker: holding.symbol,
            shares: holding.shares,
            avgPrice: holding.entry_price,
            currentPrice: lastClose,
            currentValue: lastClose * holding.shares,
            pnl: (lastClose - holding.entry_price) * holding.shares,
            pnlPercentage: ((lastClose - holding.entry_price) / holding.entry_price) * 100,
            entryDate: holding.entry_date
          };
        } catch (priceError) {
          console.error(`Error fetching price for ${holding.symbol}:`, priceError);
          return {
            id: holding.id,
            ticker: holding.symbol,
            shares: holding.shares,
            avgPrice: holding.entry_price,
            currentPrice: holding.entry_price,
            currentValue: holding.entry_price * holding.shares,
            pnl: 0,
            pnlPercentage: 0,
            entryDate: holding.entry_date,
            priceError: true
          };
        }
      })
    );

    const totalValue = results.reduce((sum, stock) => sum + stock.currentValue, 0);
    const totalPnL = results.reduce((sum, stock) => sum + stock.pnl, 0);

    res.status(200).json({ 
      portfolio: results,
      totalValue: Math.round(totalValue * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      totalPnLPercentage: totalValue > 0 ? Math.round((totalPnL / (totalValue - totalPnL)) * 10000) / 100 : 0
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};
