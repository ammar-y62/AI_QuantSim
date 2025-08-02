// exports a placeholder list

exports.listAssets = (req, res) => {
  const assets = [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "VOO", name: "Vanguard S&P 500" },
    { symbol: "OAI", name: "OpenAI" },
    { symbol: "TSLA", name: "Tesla" }
  ];
  
  res.json({ assets });
};