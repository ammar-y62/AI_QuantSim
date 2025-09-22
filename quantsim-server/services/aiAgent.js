const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage } = require('@langchain/core/messages');

class AIAgent {
  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.llm = new ChatOpenAI({
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
        openAIApiKey: process.env.OPENAI_API_KEY
      });
      console.log('AI Agent initialized with OpenAI');
    } else {
      console.log('AI Agent initialized in demo mode (no OpenAI API key)');
    }
  }

  async getStockInfo(ticker) {
    // Mock stock data
    const mockData = {
      AAPL: { price: 150.25, change: 2.50, changePercent: 1.69, volume: 45000000 },
      GOOGL: { price: 2800.50, change: -15.25, changePercent: -0.54, volume: 1200000 },
      MSFT: { price: 350.75, change: 5.25, changePercent: 1.52, volume: 2800000 },
      TSLA: { price: 250.30, change: -8.75, changePercent: -3.38, volume: 8500000 }
    };

    const data = mockData[ticker.toUpperCase()] || { price: 100.00, change: 0, changePercent: 0, volume: 1000000 };
    return data;
  }

  async analyzePortfolio(userId) {
    // Mock portfolio analysis
    return {
      totalValue: 25000,
      holdings: [
        { ticker: 'AAPL', shares: 50, value: 7500, allocation: 30 },
        { ticker: 'GOOGL', shares: 2, value: 5600, allocation: 22.4 },
        { ticker: 'MSFT', shares: 15, value: 5250, allocation: 21 }
      ],
      riskLevel: 'Moderate',
      diversification: 'Good'
    };
  }

  async getMarketSummary() {
    return `Market Summary:
S&P 500: +0.8% (4,350.25)
NASDAQ: +1.2% (13,420.50)
DOW: +0.5% (34,200.75)
Market sentiment: Positive, Tech stocks leading gains`;
  }

  async processMessage(message, userId = 'demo_user') {
    try {
      const lowerMessage = message.toLowerCase();

      // Simple routing logic
      if (lowerMessage.includes('stock') || lowerMessage.includes('analyze') || /\b[a-z]{2,5}\b/.test(lowerMessage)) {
        // Extract ticker
        const tickerMatch = message.match(/\b([A-Z]{2,5})\b/);
        const ticker = tickerMatch ? tickerMatch[1] : 'AAPL';

        const stockData = await this.getStockInfo(ticker);

        // Use OpenAI if available, otherwise use mock response
        if (this.llm) {
          const prompt = `You are a financial AI assistant. Provide analysis for ${ticker} stock:

Current Data:
- Price: $${stockData.price}
- Change: ${stockData.change > 0 ? '+' : ''}${stockData.change} (${stockData.changePercent > 0 ? '+' : ''}${stockData.changePercent}%)
- Volume: ${stockData.volume.toLocaleString()}

Provide a brief, helpful analysis including:
1. Current performance
2. Brief outlook
3. Simple recommendation (Buy/Hold/Sell)

Keep response under 150 words.`;

          const response = await this.llm.invoke([new HumanMessage(prompt)]);
          return `📊 ${ticker} Analysis:\n\n${response.content}`;
        } else {
          return `📊 ${ticker} Analysis:
💰 Current Price: $${stockData.price}
📈 Change: ${stockData.change > 0 ? '+' : ''}${stockData.change} (${stockData.changePercent > 0 ? '+' : ''}${stockData.changePercent}%)
📊 Volume: ${stockData.volume.toLocaleString()}

${stockData.changePercent > 0 ? '🟢' : '🔴'} ${stockData.changePercent > 0 ? 'Positive' : 'Negative'} performance today.

💡 Recommendation: ${stockData.changePercent > 2 ? 'Strong Buy' : stockData.changePercent > 0 ? 'Buy' : stockData.changePercent > -2 ? 'Hold' : 'Consider Sell'}

*Demo mode - Add OpenAI API key for advanced AI analysis*`;
        }

      } else if (lowerMessage.includes('portfolio')) {
        const portfolio = await this.analyzePortfolio(userId);

        return `💼 Portfolio Analysis for ${userId}:
💰 Total Value: $${portfolio.totalValue.toLocaleString()}
⚖️ Risk Level: ${portfolio.riskLevel}
🎯 Diversification: ${portfolio.diversification}

📈 Top Holdings:
${portfolio.holdings.map(h => `• ${h.ticker}: ${h.allocation}% (${h.shares} shares)`).join('\n')}

💡 Recommendations:
• Consider rebalancing if any holding exceeds 40%
• Monitor tech sector exposure
• Review quarterly performance

This is a demo response. Connect to real portfolio data for personalized insights.`;

      } else if (lowerMessage.includes('market')) {
        const marketData = await this.getMarketSummary();

        return `🌍 Market Overview:
${marketData}

📊 Key Insights:
• Tech sector showing strength
• Market sentiment remains positive
• Consider defensive positions in volatile times

💡 Trading Tip: Diversify across sectors for better risk management.

This is a demo response. Connect real market data for live updates.`;

      } else {
        // General financial assistant
        return `🤖 Hi! I'm your AI Financial Assistant. I can help you with:

📊 Stock Analysis - "Analyze AAPL"
💼 Portfolio Review - "Check my portfolio"
🌍 Market Updates - "Market summary"
📈 Investment Tips - Ask me anything!

Try asking: "Analyze TSLA" or "Portfolio analysis"

This is a demo version. Connect OpenAI API for advanced AI capabilities!`;
      }

    } catch (error) {
      console.error('AI Agent error:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again or ask me about stocks, portfolio analysis, or market trends.';
    }
  }
}

module.exports = AIAgent;
