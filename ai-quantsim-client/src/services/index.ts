// Export all API services
export { default as api } from './api'
export { default as portfolioService } from './portfolio'
export { default as aiService } from './ai'
export { default as authService } from './auth'
export { default as stockService } from './stock'

// Export types
export type {
  PortfolioItem,
  PortfolioAnalysis,
  AnalysisRequest
} from './portfolio'

export type {
  AIQuestion,
  AIResponse,
  ForecastRequest,
  ForecastResponse
} from './ai'

export type {
  LoginCredentials,
  RegisterData,
  User,
  AuthResponse
} from './auth'

export type {
  StockSearchResult,
  StockHistoryData,
  StockHistoryResponse,
  ForecastData,
  ForecastResponse
} from './stock'