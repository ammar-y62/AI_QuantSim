import { api } from './api'

// Types for portfolio data
export interface PortfolioItem {
  ticker: string
  weight: number
}

export interface PortfolioAnalysis {
  id: string
  portfolio: PortfolioItem[]
  metrics: {
    sharpeRatio: number
    volatility: number
    maxDrawdown: number
    totalReturn: number
    cagr: number
    beta: number
  }
  performance: {
    dates: string[]
    values: number[]
  }
  createdAt: string
}

export interface AnalysisRequest {
  portfolio: PortfolioItem[]
  startDate?: string
  endDate?: string
  riskFreeRate?: number
}

// Portfolio API service functions
export const portfolioService = {
  // Analyze portfolio performance
  async analyzePortfolio(data: AnalysisRequest): Promise<PortfolioAnalysis> {
    const response = await api.post('/portfolio/analyze', data)
    return response.data
  },

  // Get portfolio analysis by ID
  async getAnalysis(id: string): Promise<PortfolioAnalysis> {
    const response = await api.get(`/portfolio/analysis/${id}`)
    return response.data
  },

  // Get user's saved portfolios
  async getSavedPortfolios(): Promise<PortfolioAnalysis[]> {
    const response = await api.get('/portfolio/saved')
    return response.data
  },

  // Save portfolio analysis
  async saveAnalysis(analysis: PortfolioAnalysis): Promise<PortfolioAnalysis> {
    const response = await api.post('/portfolio/save', analysis)
    return response.data
  },

  // Delete saved portfolio
  async deleteAnalysis(id: string): Promise<void> {
    await api.delete(`/portfolio/analysis/${id}`)
  },

  // Get stock data for a ticker
  async getStockData(ticker: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/stocks/${ticker}?${params.toString()}`)
    return response.data
  },

  // Get multiple stocks data
  async getMultipleStocksData(tickers: string[], startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    params.append('tickers', tickers.join(','))
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/stocks/batch?${params.toString()}`)
    return response.data
  }
}

export default portfolioService