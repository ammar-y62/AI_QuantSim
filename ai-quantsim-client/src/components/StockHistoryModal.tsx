import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import { stockService } from '@/services'
import type { StockHistoryResponse } from '@/services/stock'

interface StockHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  ticker: string
}

function StockHistoryModal({ isOpen, onClose, ticker }: StockHistoryModalProps): JSX.Element {
  const [historyData, setHistoryData] = useState<StockHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('1y')

  useEffect(() => {
    if (isOpen && ticker) {
      loadHistory()
    }
  }, [isOpen, ticker, period])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await stockService.getStockHistory(ticker, period)
      setHistoryData(data)
    } catch (err) {
      setError('Failed to load stock history')
      console.error('Error loading stock history:', err)
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

  const getPriceChange = (current: number, previous: number) => {
    const change = current - previous
    const percentChange = (change / previous) * 100
    return { change, percentChange }
  }

  const latestData = historyData?.data && historyData.data.length > 0 ? historyData.data[historyData.data.length - 1] : null
  const previousData = historyData?.data && historyData.data.length > 1 ? historyData.data[historyData.data.length - 2] : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Stock History - {ticker}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading stock history...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadHistory}>Retry</Button>
          </div>
        )}

        {historyData && !loading && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Time Period:</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="2y">2 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Price Summary */}
            {latestData && previousData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Price Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Current Price</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatPrice(latestData.close)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Change</p>
                      {(() => {
                        const { change, percentChange } = getPriceChange(latestData.close, previousData.close)
                        const isPositive = change >= 0
                        return (
                          <div className="flex items-center justify-center gap-1">
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPrice(Math.abs(change))}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">% Change</p>
                      {(() => {
                        const { percentChange } = getPriceChange(latestData.close, previousData.close)
                        const isPositive = percentChange >= 0
                        return (
                          <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                          </span>
                        )
                      })()}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Volume</p>
                      <p className="text-lg font-bold text-slate-900">
                        {new Intl.NumberFormat().format(latestData.volume)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Range */}
            {latestData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Trading Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Open</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatPrice(latestData.open)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">High</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(latestData.high)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Low</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatPrice(latestData.low)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Close</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatPrice(latestData.close)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historical Data Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historical Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 font-medium text-slate-700">Date</th>
                        <th className="text-right py-2 font-medium text-slate-700">Open</th>
                        <th className="text-right py-2 font-medium text-slate-700">High</th>
                        <th className="text-right py-2 font-medium text-slate-700">Low</th>
                        <th className="text-right py-2 font-medium text-slate-700">Close</th>
                        <th className="text-right py-2 font-medium text-slate-700">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.data && historyData.data.length > 0 ? (
                        historyData.data.slice(-10).reverse().map((item, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 text-slate-600">{formatDate(item.date)}</td>
                            <td className="py-2 text-right">{formatPrice(item.open)}</td>
                            <td className="py-2 text-right text-green-600">{formatPrice(item.high)}</td>
                            <td className="py-2 text-right text-red-600">{formatPrice(item.low)}</td>
                            <td className="py-2 text-right font-medium">{formatPrice(item.close)}</td>
                            <td className="py-2 text-right text-slate-600">
                              {new Intl.NumberFormat().format(item.volume)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No historical data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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

export default StockHistoryModal