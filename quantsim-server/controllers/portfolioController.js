const polygonService = require('../services/polygonService');

exports.savePortfolio = (req, res) => {
  const { assets, weights } = req.body;
  res.json({ message: 'Portfolio options and triggers saved', assets, weights });
};

exports.getUserPortfolio = (req, res) => {
  // Replace with DB call using user id/username (req should come from frontend with either of those)
  const mockPortfolios = [
    {
      id: 1,
      name: "Tech Growth",
      assets: [
        { symbol: "AAPL", weight: 0.4 },
        { symbol: "MSFT", weight: 0.3 },
        { symbol: "GOOG", weight: 0.3 }
      ],
      createdAt: "2025-08-01"
    },
    {
      id: 2,
      name: "Balanced ETF Mix",
      assets: [
        { symbol: "VOO", weight: 0.5 },
        { symbol: "BND", weight: 0.5 }
      ],
      createdAt: "2025-08-05"
    }
  ];

  res.json({ portfolios: mockPortfolios });
};
