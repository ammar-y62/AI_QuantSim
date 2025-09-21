import { useState, useEffect, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, TrendingUp, User, Building2, History, Target, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import StockAutocomplete from '@/components/StockAutocomplete'
import StockHistoryModal from '@/components/StockHistoryModal'
import StockForecastModal from '@/components/StockForecastModal'
import MyAccount from '@/pages/MyAccount'
import StockList from '@/pages/StockList'
import { portfolioService, type SavePortfolioRequest, type PortfolioResponse } from '@/services/portfolio'
import { dashboardService, type DashboardResponse } from '@/services/dashboard'
import { useAuthStore } from '@/stores/authStore'

// Type definitions
interface PortfolioRow {
  id: number
  ticker: string
  shares: string
  avgPrice: string
}

interface ValidationErrors {
  [key: string]: string
}

type Page = 'portfolio' | 'account' | 'stocklist'

function Dashboard() {
  const { user } = useAuthStore()
  const [currentPage, setCurrentPage] = useState<Page>('portfolio')
  const [portfolioRows, setPortfolioRows] = useState<PortfolioRow[]>([
    { id: 1, ticker: '', shares: '', avgPrice: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [portfolioData, setPortfolioData] = useState<PortfolioResponse | null>(null)
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState<boolean>(false)

  // Modal states
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [forecastModalOpen, setForecastModalOpen] = useState(false)
  const [selectedTicker, setSelectedTicker] = useState('')

  const addRow = (): void => {
    const newId = Math.max(...portfolioRows.map(row => row.id)) + 1
    setPortfolioRows([...portfolioRows, { id: newId, ticker: '', weight: '' }])
  }

  const removeRow = (id: number): void => {
    if (portfolioRows.length > 1) {
      setPortfolioRows(portfolioRows.filter(row => row.id !== id))
      // Clear errors for removed row
      const newErrors = { ...errors }
      delete newErrors[`ticker-${id}`]
      delete newErrors[`weight-${id}`]
      setErrors(newErrors)
    }
  }

  const updateRow = (id: number, field: keyof Omit<PortfolioRow, 'id'>, value: string): void => {
    setPortfolioRows(portfolioRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ))

    // Clear error for this field when user starts typing
    const errorKey = `${field}-${id}`
    if (errors[errorKey]) {
      const newErrors = { ...errors }
      delete newErrors[errorKey]
      setErrors(newErrors)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    portfolioRows.forEach(row => {
      // Validate ticker
      if (!row.ticker.trim()) {
        newErrors[`ticker-${row.id}`] = 'Ticker is required'
      } else if (!/^[A-Z]{1,5}$/.test(row.ticker.trim().toUpperCase())) {
        newErrors[`ticker-${row.id}`] = 'Invalid ticker format'
      }

      // Validate shares
      if (!row.shares.trim()) {
        newErrors[`shares-${row.id}`] = 'Shares is required'
      } else {
        const shares = parseFloat(row.shares)
        if (isNaN(shares) || shares <= 0) {
          newErrors[`shares-${row.id}`] = 'Shares must be greater than 0'
        }
      }

      // Validate avgPrice
      if (!row.avgPrice.trim()) {
        newErrors[`avgPrice-${row.id}`] = 'Average price is required'
      } else {
        const avgPrice = parseFloat(row.avgPrice)
        if (isNaN(avgPrice) || avgPrice <= 0) {
          newErrors[`avgPrice-${row.id}`] = 'Average price must be greater than 0'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Save each stock to portfolio
      for (const row of portfolioRows) {
        if (row.ticker.trim() && row.shares.trim() && row.avgPrice.trim()) {
          const portfolioData: SavePortfolioRequest = {
            ticker: row.ticker.toUpperCase(),
            shares: parseFloat(row.shares),
            avgPrice: parseFloat(row.avgPrice)
          }
          
          await portfolioService.savePortfolio(portfolioData)
        }
      }

      // Load updated portfolio data
      await loadPortfolio()
      
      console.log('Portfolio saved successfully')
      
    } catch (error) {
      console.error('Failed to save portfolio:', error)
      setErrors({ submit: 'Failed to save portfolio. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadPortfolio = async () => {
    if (!user?.uid) return
    
    setIsLoadingPortfolio(true)
    try {
      const data = await dashboardService.getDashboard(user.uid)
      setPortfolioData(data)
    } catch (error) {
      console.error('Failed to load portfolio:', error)
    } finally {
      setIsLoadingPortfolio(false)
    }
  }

  // Load portfolio on component mount
  useEffect(() => {
    loadPortfolio()
  }, [user?.uid])

  const handleHistoryClick = (ticker: string) => {
    setSelectedTicker(ticker)
    setHistoryModalOpen(true)
  }

  const handleForecastClick = (ticker: string) => {
    setSelectedTicker(ticker)
    setForecastModalOpen(true)
  }

  const totalWeight: number = portfolioRows.reduce((sum, row) => {
    const weight = parseFloat(row.weight) || 0
    return sum + weight
  }, 0)

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const renderPortfolioPage = () => (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Build Your Portfolio</CardTitle>
          <p className="text-slate-600">Enter stock tickers, number of shares, and average purchase price.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Portfolio Rows */}
            <div className="space-y-4">
              {portfolioRows.map((row) => (
                <div key={row.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Stock Ticker
                    </label>
                    <StockAutocomplete
                      value={row.ticker}
                      onChange={(value) => updateRow(row.id, 'ticker', value)}
                      placeholder="e.g., AAPL"
                      className={errors[`ticker-${row.id}`] ? 'border-red-500' : ''}
                    />
                    {errors[`ticker-${row.id}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`ticker-${row.id}`]}</p>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Shares
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      min="0"
                      step="0.01"
                      value={row.shares}
                      onChange={(e) => updateRow(row.id, 'shares', e.target.value)}
                      className={`${errors[`shares-${row.id}`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`shares-${row.id}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`shares-${row.id}`]}</p>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Average Price ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="150.00"
                      min="0"
                      step="0.01"
                      value={row.avgPrice}
                      onChange={(e) => updateRow(row.id, 'avgPrice', e.target.value)}
                      className={`${errors[`avgPrice-${row.id}`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`avgPrice-${row.id}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`avgPrice-${row.id}`]}</p>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    {row.ticker && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleHistoryClick(row.ticker)}
                          className="h-10 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <History className="h-4 w-4 mr-1" />
                          History
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleForecastClick(row.ticker)}
                          className="h-10 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Forecast
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRow(row.id)}
                      disabled={portfolioRows.length === 1}
                      className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Row Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={addRow}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Stock
              </Button>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-500 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? 'Saving Portfolio...' : 'Save Portfolio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Portfolio Display */}
      {isLoadingPortfolio ? (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="text-slate-600">Loading portfolio...</div>
          </CardContent>
        </Card>
      ) : portfolioData && portfolioData.portfolio.length > 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Portfolio Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Performance Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Total Return</h3>
                  </div>
                  <p className={`text-3xl font-bold flex items-center ${
                    analysisResult.metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(analysisResult.metrics.totalReturn)}
                    {analysisResult.metrics.totalReturn >= 0 ? (
                      <ArrowUpRight className="h-6 w-6 ml-1" />
                    ) : (
                      <ArrowDownRight className="h-6 w-6 ml-1" />
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Sharpe Ratio</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {analysisResult.metrics.sharpeRatio.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <PieChart className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Volatility</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatPercentage(analysisResult.metrics.volatility)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Max Drawdown</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    {formatPercentage(analysisResult.metrics.maxDrawdown)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">CAGR</h3>
                  </div>
                  <p className={`text-3xl font-bold ${
                    analysisResult.metrics.cagr >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(analysisResult.metrics.cagr)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <BarChart3 className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">Beta</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {analysisResult.metrics.beta.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Composition */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Composition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResult.portfolio.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                            {item.ticker}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                            {item.weight}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </div>

            {/* Save Portfolio Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => portfolioService.saveAnalysis(analysisResult)}
                className="px-6 py-3"
              >
                Save Portfolio Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Financial Portfolio Builder</h1>
                <p className="text-slate-600">Create and analyze your custom investment portfolio</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Button
                variant={currentPage === 'portfolio' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('portfolio')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Portfolio
              </Button>
              <Button
                variant={currentPage === 'stocklist' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('stocklist')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Stock List
              </Button>
              <Button
                variant={currentPage === 'account' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('account')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                My Account
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      {currentPage === 'portfolio' && renderPortfolioPage()}
      {currentPage === 'account' && <MyAccount />}
      {currentPage === 'stocklist' && <StockList />}

      {/* Modals */}
      <StockHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        ticker={selectedTicker}
      />
      <StockForecastModal
        isOpen={forecastModalOpen}
        onClose={() => setForecastModalOpen(false)}
        ticker={selectedTicker}
      />
    </div>
  )
}

export default Dashboard