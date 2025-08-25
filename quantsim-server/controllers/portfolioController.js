const { query } = require('../config/database');
const polygonService = require('../services/polygonService');

// Save/Update portfolio (add or update stock)
exports.savePortfolio = async (req, res) => {
  try {
    const { ticker, shares, avgPrice, portfolioName = 'My Portfolio' } = req.body;
    const userId = req.dbUser.id; // Get from authenticated user

    if (!ticker || !shares || !avgPrice) {
      return res.status(400).json({ error: "Missing required fields: ticker, shares, avgPrice" });
    }

    if (shares <= 0) {
      return res.status(400).json({ error: "Shares must be greater than 0" });
    }

    if (avgPrice <= 0) {
      return res.status(400).json({ error: "Average price must be greater than 0" });
    }

    // Get or create default portfolio for user
    let portfolioResult = await query(
      'SELECT id FROM portfolios WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    let portfolioId;
    if (portfolioResult.rows.length === 0) {
      // Create default portfolio
      const newPortfolioResult = await query(
        'INSERT INTO portfolios (user_id, name, description) VALUES ($1, $2, $3) RETURNING id',
        [userId, portfolioName, 'Default portfolio']
      );
      portfolioId = newPortfolioResult.rows[0].id;
    } else {
      portfolioId = portfolioResult.rows[0].id;
    }

    // Check if stock already exists in portfolio
    const existingStockResult = await query(
      'SELECT * FROM portfolio_holdings WHERE portfolio_id = $1 AND symbol = $2',
      [portfolioId, ticker.toUpperCase()]
    );
    
    if (existingStockResult.rows.length > 0) {
      // Update existing stock
      const currentHolding = existingStockResult.rows[0];
      const totalShares = parseFloat(currentHolding.shares) + parseFloat(shares);
      const newAvgPrice = ((parseFloat(currentHolding.shares) * parseFloat(currentHolding.entry_price)) + (parseFloat(shares) * parseFloat(avgPrice))) / totalShares;
      
      await query(
        'UPDATE portfolio_holdings SET shares = $1, entry_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [totalShares, newAvgPrice, currentHolding.id]
      );
      
      res.status(200).json({ 
        message: "Portfolio updated successfully",
        action: "updated",
        ticker: ticker.toUpperCase(),
        totalShares,
        newAvgPrice
      });
    } else {
      // Add new stock
      await query(
        'INSERT INTO portfolio_holdings (portfolio_id, symbol, shares, entry_price, entry_date) VALUES ($1, $2, $3, $4, CURRENT_DATE)',
        [portfolioId, ticker.toUpperCase(), shares, avgPrice]
      );
      
      res.status(201).json({ 
        message: "Stock added to portfolio successfully",
        action: "added",
        ticker: ticker.toUpperCase()
      });
    }

  } catch (err) {
    console.error('Save portfolio error:', err);
    res.status(500).json({ error: "Failed to save portfolio" });
  }
};

// Get user portfolio with live prices
exports.getUserPortfolio = async (req, res) => {
  try {
    const userId = req.dbUser.id;
    
    // Get user's portfolio and holdings
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

    const portfolio = [];
    let totalValue = 0;
    let totalPnL = 0;

    // Get live prices for all stocks in portfolio
    const portfolioPromises = portfolioResult.rows.map(async (holding) => {
      try {
        // Get current price from Polygon API
        const currentPriceData = await polygonService.getStockHistory(holding.symbol, "1d");
        const currentPrice = currentPriceData.results?.[currentPriceData.results.length - 1]?.c || holding.entry_price;
        
        const currentValue = currentPrice * holding.shares;
        const pnl = (currentPrice - holding.entry_price) * holding.shares;
        const pnlPercentage = ((currentPrice - holding.entry_price) / holding.entry_price) * 100;
        
        totalValue += currentValue;
        totalPnL += pnl;
        
        return {
          id: holding.id,
          ticker: holding.symbol,
          shares: holding.shares,
          avgPrice: holding.entry_price,
          currentPrice,
          currentValue,
          pnl,
          pnlPercentage,
          entryDate: holding.entry_date
        };
      } catch (priceError) {
        console.error(`Error fetching price for ${holding.symbol}:`, priceError);
        // Return stock data without live price if API fails
        return {
          id: holding.id,
          ticker: holding.symbol,
          shares: holding.shares,
          avgPrice: holding.entry_price,
          currentPrice: holding.entry_price, // Fallback to entry price
          currentValue: holding.entry_price * holding.shares,
          pnl: 0,
          pnlPercentage: 0,
          entryDate: holding.entry_date,
          priceError: true
        };
      }
    });

    const portfolioWithPrices = await Promise.all(portfolioPromises);

    res.status(200).json({
      portfolio: portfolioWithPrices,
      totalValue: Math.round(totalValue * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      totalPnLPercentage: totalValue > 0 ? Math.round((totalPnL / (totalValue - totalPnL)) * 10000) / 100 : 0
    });

  } catch (err) {
    console.error('Get portfolio error:', err);
    res.status(500).json({ error: "Failed to get portfolio" });
  }
};

// Add stock to portfolio
exports.addStock = async (req, res) => {
  try {
    const { ticker, shares, avgPrice, portfolioName = 'My Portfolio' } = req.body;
    const userId = req.dbUser.id;

    if (!ticker || !shares || !avgPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get or create portfolio
    let portfolioResult = await query(
      'SELECT id FROM portfolios WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    let portfolioId;
    if (portfolioResult.rows.length === 0) {
      const newPortfolioResult = await query(
        'INSERT INTO portfolios (user_id, name, description) VALUES ($1, $2, $3) RETURNING id',
        [userId, portfolioName, 'Default portfolio']
      );
      portfolioId = newPortfolioResult.rows[0].id;
    } else {
      portfolioId = portfolioResult.rows[0].id;
    }

    await query(
      'INSERT INTO portfolio_holdings (portfolio_id, symbol, shares, entry_price, entry_date) VALUES ($1, $2, $3, $4, CURRENT_DATE)',
      [portfolioId, ticker.toUpperCase(), shares, avgPrice]
    );

    res.status(201).json({ message: "Stock added successfully" });
  } catch (err) {
    console.error('Add stock error:', err);
    res.status(500).json({ error: "Failed to add stock" });
  }
};

// Get basic portfolio
exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.dbUser.id;
    const portfolioResult = await query(
      'SELECT p.id, p.name, ph.symbol, ph.shares, ph.entry_price, ph.entry_date FROM portfolios p JOIN portfolio_holdings ph ON p.id = ph.portfolio_id WHERE p.user_id = $1 AND p.is_active = true',
      [userId]
    );

    const portfolio = portfolioResult.rows.map(row => ({
      id: row.id,
      ticker: row.symbol,
      shares: row.shares,
      avgPrice: row.entry_price,
      entryDate: row.entry_date
    }));

    res.status(200).json(portfolio);
  } catch (err) {
    console.error('Get portfolio error:', err);
    res.status(500).json({ error: "Failed to get portfolio" });
  }
};

// Remove stock from portfolio
exports.removeStock = async (req, res) => {
  try {
    const { ticker } = req.params;
    const userId = req.dbUser.id;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker is required" });
    }

    // Get portfolio ID for user
    const portfolioResult = await query(
      'SELECT p.id FROM portfolios p JOIN portfolio_holdings ph ON p.id = ph.portfolio_id WHERE p.user_id = $1 AND ph.symbol = $2',
      [userId, ticker.toUpperCase()]
    );
    
    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({ error: "Stock not found in portfolio" });
    }

    const portfolioId = portfolioResult.rows[0].id;

    await query(
      'DELETE FROM portfolio_holdings WHERE portfolio_id = $1 AND symbol = $2',
      [portfolioId, ticker.toUpperCase()]
    );

    res.status(200).json({ message: "Stock removed successfully" });
  } catch (err) {
    console.error('Remove stock error:', err);
    res.status(500).json({ error: "Failed to remove stock" });
  }
};

// Update stock in portfolio
exports.updateStock = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { shares, avgPrice } = req.body;
    const userId = req.dbUser.id;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker is required" });
    }

    // Get portfolio ID for user
    const portfolioResult = await query(
      'SELECT p.id FROM portfolios p JOIN portfolio_holdings ph ON p.id = ph.portfolio_id WHERE p.user_id = $1 AND ph.symbol = $2',
      [userId, ticker.toUpperCase()]
    );
    
    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({ error: "Stock not found in portfolio" });
    }

    const portfolioId = portfolioResult.rows[0].id;

    const updateData = { updated_at: new Date() };
    
    if (shares !== undefined) {
      await query(
        'UPDATE portfolio_holdings SET shares = $1, updated_at = CURRENT_TIMESTAMP WHERE portfolio_id = $2 AND symbol = $3',
        [shares, portfolioId, ticker.toUpperCase()]
      );
      updateData.shares = shares;
    }
    
    if (avgPrice !== undefined) {
      await query(
        'UPDATE portfolio_holdings SET entry_price = $1, updated_at = CURRENT_TIMESTAMP WHERE portfolio_id = $2 AND symbol = $3',
        [avgPrice, portfolioId, ticker.toUpperCase()]
      );
      updateData.avgPrice = avgPrice;
    }

    res.status(200).json({ 
      message: "Stock updated successfully",
      updatedFields: Object.keys(updateData)
    });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ error: "Failed to update stock" });
  }
};
