const { db } = require('../services/firebaseService');
const polygonService = require('../services/polygonService');

// Predict stock return (main forecasting endpoint)
exports.predictReturn = async (req, res) => {
  const { ticker } = req.params;
  // then we will send the ticker as an agument to the ML ammar built, and assign the response we get to a variable that will display the message
  res.json({ message: 'AAPL (Apple) stock is expected to fall by 10% based on market factors and News Announcements regarding the company' });
};
