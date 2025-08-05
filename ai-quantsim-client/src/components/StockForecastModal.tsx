import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Brain } from 'lucide-react'
import { stockService } from '@/services'
import type { ForecastResponse } from '@/services/stock'

interface StockForecastModalProps {
  isOpen: boolean
  onClose: () => void
  ticker: string
}

function StockForecastModal({ isOpen, onClose, ticker }: StockForecastModalProps): JSX.Element {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && ticker) {
      loadForecast()
    }
  }, [isOpen, ticker])

  const loadForecast = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await stockService.getStockForecast(ticker)
      setForecastData(data)
    } catch (err) {
      setError('Failed to load stock forecast')
      console.error('Error loading stock forecast:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-slate-600" />
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Stock Forecast - {ticker}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Generating forecast...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadForecast}>Retry</Button>
          </div>
        )}

        {forecastData && !loading && (
          <div className="space-y-6">
            {/* Forecast Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Forecast Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Model Used</p>
                    <p className="text-lg font-bold text-slate-900">{forecastData.model}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Last Updated</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatDate(forecastData.lastUpdated)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Forecast Period</p>
                    <p className="text-lg font-bold text-slate-900">
                      {forecastData.forecast.length} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forecast Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Price Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.forecast.slice(0, 7).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">
                          {formatDate(prediction.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Predicted Price</p>
                          <p className="text-lg font-bold text-slate-900">
                            {formatPrice(prediction.predictedPrice)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {getDirectionIcon(prediction.direction)}
                          <span className={`font-medium ${getDirectionColor(prediction.direction)}`}>
                            {prediction.direction.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-slate-600">Confidence</p>
                          <div className="flex items-center gap-2">
                            <Progress value={prediction.confidence} className="w-16 h-2" />
                            <span className={`text-sm font-bold ${getConfidenceColor(prediction.confidence)}`}>
                              {prediction.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forecast Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Forecast Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Chart visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Volatility Risk</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Medium
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Market Risk</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Low
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Prediction Accuracy</span>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        High
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Recommended Action</span>
                      <Badge className="bg-green-100 text-green-800">
                        Hold
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-100 rounded">
                    <Target className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">Important Disclaimer</h4>
                    <p className="text-sm text-amber-700">
                      This forecast is generated using AI models and historical data analysis.
                      It should not be considered as financial advice. Always conduct your own
                      research and consult with financial professionals before making investment decisions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StockForecastModal