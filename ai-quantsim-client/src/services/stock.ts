import { api } from './api'

// Types
export interface StockSearchResult {
  ticker: string
  name: string
  exchange?: string
}

export interface StockHistoryData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockHistoryResponse {
  ticker: string
  data: StockHistoryData[]
  period: string
}

export interface ForecastData {
  date: string
  predictedPrice: number
  confidence: number
  direction: 'up' | 'down' | 'neutral'
}

export interface ForecastResponse {
  ticker: string
  forecast: ForecastData[]
  model: string
  lastUpdated: string
}

// Stock search with autocomplete
export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  try {
    const response = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`)
    return response.data
  } catch (error) {
    console.error('Error searching stocks:', error)
    return []
  }
}

// Get stock history
export const getStockHistory = async (ticker: string, period: string = '1y'): Promise<StockHistoryResponse> => {
  try {
    const response = await api.get(`/stocks/${ticker}/history?period=${period}`)
    return response.data
  } catch (error) {
    console.error('Error fetching stock history:', error)
    throw error
  }
}

// Get stock forecast
export const getStockForecast = async (ticker: string): Promise<ForecastResponse> => {
  try {
    const response = await api.get(`/stocks/${ticker}/forecast`)
    return response.data
  } catch (error) {
    console.error('Error fetching stock forecast:', error)
    throw error
  }
}

// Get all stocks for stock list page
export const getAllStocks = async (page: number = 1, limit: number = 50): Promise<StockSearchResult[]> => {
  try {
    const response = await api.get(`/stocks/list?page=${page}&limit=${limit}`)
    // The backend returns data in a 'results' property, so we need to extract it
    const data = response.data.results || response.data || []
    
    // Transform the data to match our StockSearchResult interface
    return data.map((stock: any) => ({
      ticker: stock.ticker || stock.symbol,
      name: stock.name || stock.company_name || 'Unknown Company',
      exchange: stock.primary_exchange || stock.exchange
    }))
  } catch (error) {
    console.error('Error fetching all stocks:', error)
    return []
  }
}

export default {
  searchStocks,
  getStockHistory,
  getStockForecast,
  getAllStocks
}