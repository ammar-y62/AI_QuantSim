const { db } = require("../firebase");
const polygonService = require("../services/polygonService");

// Get dashboard overview for a user
exports.getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user portfolio first
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("portfolio")
      .get();

    const portfolio = [];
    snapshot.forEach((doc) => portfolio.push(doc.data()));

    // Fetch live prices of the stocks from polygon api
    const results = await Promise.all(
      portfolio.map(async (stock) => {
        const history = await polygonService.getStockHistory(stock.ticker, "1m");

        const lastClose =
          history.results?.[history.results.length - 1]?.c || stock.avgPrice;

        return {
          ticker: stock.ticker,
          shares: stock.shares,
          avgPrice: stock.avgPrice,
          currentPrice: lastClose,
          pnl: (lastClose - stock.avgPrice) * stock.shares,
        };
      })
    );

    res.status(200).json({ portfolio: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
