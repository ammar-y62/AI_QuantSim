import { api } from './api'

// Types for dashboard data matching backend API
export interface DashboardHolding {
  id: string
  ticker: string
  shares: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  pnl: number
  pnlPercentage: number
  entryDate: string
  priceError?: boolean
}

export interface DashboardResponse {
  portfolio: DashboardHolding[]
  totalValue: number
  totalPnL: number
  totalPnLPercentage: number
}

// Dashboard API service functions
export const dashboardService = {
  // Get dashboard data for a user
  async getDashboard(userId: string): Promise<DashboardResponse> {
    const response = await api.get(`/dashboard/${userId}`)
    return response.data
  }
}

export default dashboardService
