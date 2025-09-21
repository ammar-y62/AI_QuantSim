import { api } from './api'

// Types for portfolio data matching backend API
export interface PortfolioHolding {
  id: string
  ticker: string
  shares: number
  avgPrice: number
  currentPrice?: number
  currentValue?: number
  pnl?: number
  pnlPercentage?: number
  entryDate: string
}

export interface PortfolioResponse {
  portfolio: PortfolioHolding[]
  totalValue: number
  totalPnL: number
  totalPnLPercentage: number
}

export interface SavePortfolioRequest {
  ticker: string
  shares: number
  avgPrice: number
  portfolioName?: string
}

export interface UpdateStockRequest {
  shares?: number
  avgPrice?: number
}

// Portfolio API service functions matching backend endpoints
export const portfolioService = {
  // Save/update stock in portfolio
  async savePortfolio(data: SavePortfolioRequest): Promise<any> {
    const response = await api.post('/portfolio/save', data)
    return response.data
  },

  // Get user portfolio with live prices
  async getUserPortfolio(): Promise<PortfolioResponse> {
    const response = await api.get('/portfolio/userPortfolio')
    return response.data
  },

  // Get basic portfolio (without live prices)
  async getPortfolio(): Promise<PortfolioHolding[]> {
    const response = await api.get('/portfolio/portfolio')
    return response.data
  },

  // Add new stock to portfolio
  async addStock(data: SavePortfolioRequest): Promise<any> {
    const response = await api.post('/portfolio/add', data)
    return response.data
  },

  // Update existing stock in portfolio
  async updateStock(ticker: string, data: UpdateStockRequest): Promise<any> {
    const response = await api.put(`/portfolio/${ticker}`, data)
    return response.data
  },

  // Remove stock from portfolio
  async removeStock(ticker: string): Promise<any> {
    const response = await api.delete(`/portfolio/${ticker}`)
    return response.data
  }
}

export default portfolioService