// Export all API services
export { default as api } from './api'
export { default as portfolioService } from './portfolio'
export { default as aiService } from './ai'
export { default as authService } from './auth'

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