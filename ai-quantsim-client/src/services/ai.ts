import { api } from './api'

// Types for AI assistant
export interface AIQuestion {
  question: string
  portfolioId?: string
  context?: string
}

export interface AIResponse {
  answer: string
  sources?: string[]
  confidence?: number
  suggestions?: string[]
}

export interface ForecastRequest {
  ticker: string
  days: number
  confidence?: number
}

export interface ForecastResponse {
  ticker: string
  predictions: {
    date: string
    price: number
    confidence: {
      lower: number
      upper: number
    }
  }[]
  model: string
  accuracy?: number
}

// AI API service functions
export const aiService = {
  // Ask AI assistant a question
  async askQuestion(data: AIQuestion): Promise<AIResponse> {
    const response = await api.post('/ai/ask', data)
    return response.data
  },

  // Get portfolio insights
  async getPortfolioInsights(portfolioId: string): Promise<AIResponse> {
    const response = await api.get(`/ai/portfolio/${portfolioId}/insights`)
    return response.data
  },

  // Get stock forecast
  async getForecast(data: ForecastRequest): Promise<ForecastResponse> {
    const response = await api.post('/ai/forecast', data)
    return response.data
  },

  // Search financial documents/news
  async searchDocuments(query: string, limit: number = 10) {
    const response = await api.get(`/ai/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data
  },

  // Get market sentiment analysis
  async getSentiment(ticker: string) {
    const response = await api.get(`/ai/sentiment/${ticker}`)
    return response.data
  },

  // Get investment recommendations
  async getRecommendations(riskProfile: 'conservative' | 'moderate' | 'aggressive') {
    const response = await api.get(`/ai/recommendations?risk=${riskProfile}`)
    return response.data
  }
}

export default aiService