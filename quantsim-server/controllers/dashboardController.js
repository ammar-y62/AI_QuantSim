exports.getDashboard = (req, res) => {
  res.json({ message: `Dashboard for ${req.params.portfolioId}` });
};
