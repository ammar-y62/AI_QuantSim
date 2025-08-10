exports.getDashboard = (req, res) => {
  const { userID } = req.params;

  // will be replace with actual data + metrics calculation once we set up the DB
  const mockDashboard = {
    userID,
    totalPortfolios: 2,
    totalValue: 25000,
    change24h: "+1.5%",
    bestPerformer: { symbol: "AAPL", change: "+3.2%" },
    worstPerformer: { symbol: "BND", change: "-0.4%" },
    recentActivity: [
      { action: "Created portfolio", portfolio: "Balanced ETF Mix", date: "2025-08-01" },
      { action: "Added AAPL to portfolio", portfolio: "Tech Growth", date: "2025-08-05" }
    ]
  };

  res.json({ dashboard: mockDashboard });
};
