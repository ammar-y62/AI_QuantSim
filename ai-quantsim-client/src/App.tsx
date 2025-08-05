import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, TrendingUp, User, Building2, History, Target } from 'lucide-react'
import StockAutocomplete from '@/components/StockAutocomplete'
import StockHistoryModal from '@/components/StockHistoryModal'
import StockForecastModal from '@/components/StockForecastModal'
import MyAccount from '@/pages/MyAccount'
import StockList from '@/pages/StockList'
import './App.css'

// Type definitions
interface PortfolioRow {
  id: number
  ticker: string
  weight: string
}

interface ValidationErrors {
  [key: string]: string
}

interface SubmittedPortfolioItem {
  ticker: string
  weight: number
}

type Page = 'portfolio' | 'account' | 'stocklist'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('portfolio')
  const [portfolioRows, setPortfolioRows] = useState<PortfolioRow[]>([
    { id: 1, ticker: '', weight: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

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
    let totalWeight = 0

    portfolioRows.forEach(row => {
      // Validate ticker
      if (!row.ticker.trim()) {
        newErrors[`ticker-${row.id}`] = 'Ticker is required'
      } else if (!/^[A-Z]{1,5}$/.test(row.ticker.trim().toUpperCase())) {
        newErrors[`ticker-${row.id}`] = 'Invalid ticker format'
      }

      // Validate weight
      if (!row.weight.trim()) {
        newErrors[`weight-${row.id}`] = 'Weight is required'
      } else {
        const weight = parseFloat(row.weight)
        if (isNaN(weight) || weight <= 0 || weight > 100) {
          newErrors[`weight-${row.id}`] = 'Weight must be between 0 and 100'
        } else {
          totalWeight += weight
        }
      }
    })

    // Check if total weight equals 100%
    if (totalWeight !== 100 && Object.keys(newErrors).length === 0) {
      newErrors.total = `Total weight must equal 100% (current: ${totalWeight.toFixed(1)}%)`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const portfolio: SubmittedPortfolioItem[] = portfolioRows.map(row => ({
      ticker: row.ticker.toUpperCase(),
      weight: parseFloat(row.weight)
    }))

    console.log('Portfolio submitted:', portfolio)
    alert('Portfolio submitted successfully! Check console for details.')

    setIsSubmitting(false)
  }

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

  const renderPortfolioPage = () => (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Build Your Portfolio</CardTitle>
          <p className="text-slate-600">Enter stock tickers and their corresponding weights. Total weight must equal 100%.</p>
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
                      Weight (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="25.0"
                      min="0"
                      max="100"
                      step="0.1"
                      value={row.weight}
                      onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
                      className={`${errors[`weight-${row.id}`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`weight-${row.id}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`weight-${row.id}`]}</p>
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

            {/* Total Weight Display */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">Total Portfolio Weight:</span>
                <span className={`font-bold text-lg ${
                  totalWeight === 100 ? 'text-green-600' :
                  totalWeight > 100 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {totalWeight.toFixed(1)}%
                </span>
              </div>
              {errors.total && (
                <p className="text-red-500 text-sm mt-2">{errors.total}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? 'Analyzing Portfolio...' : 'Submit Portfolio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section - Reserved for Future Use */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-dashed border-2 border-slate-300">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="p-4 bg-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Portfolio Analysis</h3>
            <p className="text-slate-500">
              Submit your portfolio to see detailed analysis, risk metrics, and performance charts here.
            </p>
          </div>
        </CardContent>
      </Card>
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

export default App

