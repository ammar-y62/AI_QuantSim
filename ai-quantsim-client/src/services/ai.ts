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

// AI API service functions matching backend endpoints
export const aiService = {
  // Ask AI assistant a question
  async askQuestion(data: AIQuestion): Promise<AIResponse> {
    const response = await api.post('/ai/ask', data)
    return response.data
  },

  // Get stock forecast (using forecast endpoint)
  async getForecast(ticker: string): Promise<ForecastResponse> {
    const response = await api.post('/forecast', { ticker })
    return response.data
  },

  // Search news (using search endpoint)
  async searchNews(query: string, category?: string, source?: string, sentiment?: string, limit: number = 20) {
    const response = await api.post('/search/search', {
      query,
      category,
      source,
      sentiment,
      limit
    })
    return response.data
  },

  // Get stock-specific news
  async getStockNews(ticker: string) {
    const response = await api.get(`/search/stock/${ticker}`)
    return response.data
  }
}

export default aiService