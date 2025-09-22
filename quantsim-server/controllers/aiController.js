const AIAgent = require('../services/aiAgent');

// Initialize AI agent
const aiAgent = new AIAgent();

exports.askAI = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`AI Request: ${message} from user: ${userId || 'anonymous'}`);

    // Process message with AI agent
    const response = await aiAgent.processMessage(message, userId);

    res.json({
      message: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Controller error:', error);
    res.status(500).json({
      error: 'Failed to process AI request',
      message: 'Please try again later'
    });
  }
};