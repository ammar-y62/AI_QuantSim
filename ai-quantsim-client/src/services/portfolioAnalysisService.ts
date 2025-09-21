import { api } from './api'

// Types for portfolio analysis data
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

// Portfolio Analysis API service functions
export const portfolioService = {
  // Analyze portfolio performance (placeholder - backend doesn't have this endpoint yet)
  async analyzePortfolio(data: AnalysisRequest): Promise<PortfolioAnalysis> {
    // For now, return mock data since backend doesn't have portfolio analysis endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'mock-analysis-1',
          portfolio: data.portfolio,
          metrics: {
            sharpeRatio: 1.25,
            volatility: 15.5,
            maxDrawdown: -8.2,
            totalReturn: 12.3,
            cagr: 8.7,
            beta: 1.1
          },
          performance: {
            dates: ['2023-01-01', '2023-06-01', '2023-12-01'],
            values: [10000, 10500, 11230]
          },
          createdAt: new Date().toISOString()
        })
      }, 1000)
    })
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
  }
}

export default portfolioService
