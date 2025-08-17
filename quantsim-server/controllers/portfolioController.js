const { db } = require("../services/firebaseService");
const polygonService = require("../services/polygonService");

// Save/Update portfolio (add or update stock)
exports.savePortfolio = async (req, res) => {
  try {
    const { ticker, shares, avgPrice} = req.body;
    const userId = req.user.uid; // Get from authenticated user

    if (!ticker || !shares || !avgPrice) {
      return res.status(400).json({ error: "Missing required fields: ticker, shares, avgPrice" });
    }

    if (shares <= 0) {
      return res.status(400).json({ error: "Shares must be greater than 0" });
    }

    if (avgPrice <= 0) {
      return res.status(400).json({ error: "Average price must be greater than 0" });
    }

    const stockRef = db
      .collection("users")
      .doc(userId)
      .collection("portfolio")
      .doc(ticker.toUpperCase());

    // Check if stock already exists to update or create
    const existingStock = await stockRef.get();
    
    if (existingStock.exists) {
      // Update existing stock
      const currentData = existingStock.data();
      const totalShares = currentData.shares + shares;
      const newAvgPrice = ((currentData.shares * currentData.avgPrice) + (shares * avgPrice)) / totalShares;
      
      await stockRef.update({
        shares: totalShares,
        avgPrice: newAvgPrice,
        updatedAt: new Date()
      });
      
      res.status(200).json({ 
        message: "Portfolio updated successfully",
        action: "updated",
        ticker: ticker.toUpperCase(),
        totalShares,
        newAvgPrice
      });
    } else {
      // Add new stock
      await stockRef.set({
        ticker: ticker.toUpperCase(),
        shares,
        avgPrice,
        addedAt: new Date(),
        updatedAt: new Date()
      });
      
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
    const userId = req.user.uid; // Get from authenticated user
    
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("portfolio")
      .get();

    if (snapshot.empty) {
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
    const portfolioPromises = snapshot.docs.map(async (doc) => {
      const stockData = doc.data();
      
      try {
        // Get current price from Polygon API
        const currentPriceData = await polygonService.getStockHistory(stockData.ticker, "1d");
        const currentPrice = currentPriceData.results?.[currentPriceData.results.length - 1]?.c || stockData.avgPrice;
        
        const currentValue = currentPrice * stockData.shares;
        const pnl = (currentPrice - stockData.avgPrice) * stockData.shares;
        const pnlPercentage = ((currentPrice - stockData.avgPrice) / stockData.avgPrice) * 100;
        
        totalValue += currentValue;
        totalPnL += pnl;
        
        return {
          id: doc.id,
          ticker: stockData.ticker,
          shares: stockData.shares,
          avgPrice: stockData.avgPrice,
          currentPrice,
          currentValue,
          pnl,
          pnlPercentage,
          addedAt: stockData.addedAt,
          updatedAt: stockData.updatedAt
        };
      } catch (priceError) {
        console.error(`Error fetching price for ${stockData.ticker}:`, priceError);
        // Return stock data without live price if API fails
        return {
          id: doc.id,
          ticker: stockData.ticker,
          shares: stockData.shares,
          avgPrice: stockData.avgPrice,
          currentPrice: stockData.avgPrice, // Fallback to avg price
          currentValue: stockData.avgPrice * stockData.shares,
          pnl: 0,
          pnlPercentage: 0,
          addedAt: stockData.addedAt,
          updatedAt: stockData.updatedAt,
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

// Add stock to portfolio (handled by savePortfolio)
exports.addStock = async (req, res) => {
  try {
    const { ticker, shares, avgPrice} = req.body;
    const userId = req.user.uid;

    if (!ticker || !shares || !avgPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const stockRef = db
      .collection("users")
      .doc(userId)
      .collection("portfolio")
      .doc(ticker.toUpperCase());

    await stockRef.set({
      ticker: ticker.toUpperCase(),
      shares,
      avgPrice,
      addedAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ message: "Stock added successfully" });
  } catch (err) {
    console.error('Add stock error:', err);
    res.status(500).json({ error: "Failed to add stock" });
  }
};

// Get user portfolio (handled by getUserPortfolio)
exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("portfolio")
      .get();

    const portfolio = [];
    snapshot.forEach((doc) => portfolio.push(doc.data()));

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
    const userId = req.user.uid;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker is required" });
    }

    const stockRef = db
      .collection("users")
      .doc(userId)
      .collection("portfolio")
      .doc(ticker.toUpperCase());

    const stockDoc = await stockRef.get();
    
    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock not found in portfolio" });
    }

    await stockRef.delete();

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
    const userId = req.user.uid;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker is required" });
    }

    const stockRef = db
      .collection("users")
      .doc(userId)
      .collection("portfolio")
      .doc(ticker.toUpperCase());

    const stockDoc = await stockRef.get();
    
    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock not found in portfolio" });
    }

    const updateData = { updatedAt: new Date() };
    
    if (shares !== undefined) updateData.shares = shares;
    if (avgPrice !== undefined) updateData.avgPrice = avgPrice;

    await stockRef.update(updateData);

    res.status(200).json({ 
      message: "Stock updated successfully",
      updatedFields: Object.keys(updateData)
    });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ error: "Failed to update stock" });
  }
};
