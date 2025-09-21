import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { stockService } from '@/services'
import type { StockSearchResult } from '@/services/stock'

function StockList() {
  const [stocks, setStocks] = useState<StockSearchResult[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockSearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalStocks, setTotalStocks] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [allStocksLoaded, setAllStocksLoaded] = useState(false)

  useEffect(() => {
    loadStocks()
  }, [])

  useEffect(() => {
    filterStocks()
  }, [searchQuery, stocks])

  const loadStocks = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const data = await stockService.getAllStocks(page, 100) // Load 100 stocks per page
      // Ensure data is an array
      const stocksArray = Array.isArray(data) ? data : []
      
      if (append) {
        setStocks(prevStocks => [...prevStocks, ...stocksArray])
      } else {
        setStocks(stocksArray)
        setTotalStocks(stocksArray.length) // Initial count
      }
      
      // Check if we should load more stocks
      if (stocksArray.length === 100 && !allStocksLoaded) {
        setHasNextPage(true)
      } else {
        setHasNextPage(false)
        setAllStocksLoaded(true)
      }
      
    } catch (err) {
      setError('Failed to load stocks')
      console.error('Error loading stocks:', err)
      if (!append) {
        setStocks([]) // Set empty array on error only for initial load
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const filterStocks = () => {
    if (!Array.isArray(stocks)) {
      setFilteredStocks([])
      return
    }
    
    if (!searchQuery.trim()) {
      setFilteredStocks(stocks)
    } else {
      const filtered = stocks.filter(stock =>
        stock.ticker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredStocks(filtered)
    }
  }

  const handleStockClick = (stock: StockSearchResult) => {
    // This could open a detailed view or add to portfolio
    console.log('Stock clicked:', stock)
  }

  const loadMoreStocks = () => {
    if (!loadingMore && hasNextPage && !allStocksLoaded) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadStocks(nextPage, true) // Append to existing stocks
    }
  }

  const loadAllStocks = async () => {
    setLoading(true)
    setAllStocksLoaded(false)
    setCurrentPage(1)
    
    // Load multiple pages to get more stocks
    let page = 1
    let allStocks: StockSearchResult[] = []
    let hasMore = true
    
    while (hasMore && page <= 10) { // Limit to 10 pages (1000 stocks) to avoid overwhelming the API
      try {
        const data = await stockService.getAllStocks(page, 100)
        const stocksArray = Array.isArray(data) ? data : []
        
        if (stocksArray.length === 0) {
          hasMore = false
        } else {
          allStocks = [...allStocks, ...stocksArray]
          page++
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (err) {
        console.error('Error loading page', page, err)
        hasMore = false
      }
    }
    
    setStocks(allStocks)
    setTotalStocks(allStocks.length)
    setAllStocksLoaded(true)
    setHasNextPage(false)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading stocks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => loadStocks()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Stock List</h1>
              <p className="text-slate-600">Browse and search available stocks</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search stocks by ticker or company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Loaded Stocks</p>
                  <p className="text-2xl font-bold text-slate-900">{Array.isArray(stocks) ? stocks.length : 0}</p>
                </div>
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Showing</p>
                  <p className="text-2xl font-bold text-slate-900">{Array.isArray(filteredStocks) ? filteredStocks.length : 0}</p>
                </div>
                <Search className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Exchanges</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Array.isArray(stocks) ? new Set(stocks.map(s => s.exchange).filter(Boolean)).size : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  <p className="text-sm font-bold text-slate-900">
                    {allStocksLoaded ? 'All Loaded' : hasNextPage ? 'More Available' : 'Loading...'}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Load More Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-slate-600">
                {allStocksLoaded ? (
                  <span>All available stocks loaded ({stocks.length} total)</span>
                ) : (
                  <span>Loaded {stocks.length} stocks. {hasNextPage ? 'More available.' : 'Loading...'}</span>
                )}
              </div>
              <div className="flex gap-2">
                {!allStocksLoaded && hasNextPage && (
                  <Button
                    onClick={loadMoreStocks}
                    disabled={loadingMore}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-4 w-4" />
                        Load More (100)
                      </>
                    )}
                  </Button>
                )}
                {!allStocksLoaded && (
                  <Button
                    onClick={loadAllStocks}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading All...
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4" />
                        Load All Stocks
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(filteredStocks) && filteredStocks.map((stock) => (
            <Card
              key={stock.ticker}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStockClick(stock)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{stock.ticker}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{stock.name}</p>
                  </div>
                  {stock.exchange && (
                    <Badge variant="secondary" className="text-xs">
                      {stock.exchange}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Details
                  </Button>
                  <Button size="sm" className="text-xs">
                    Add to Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {Array.isArray(filteredStocks) && filteredStocks.length === 0 && searchQuery && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No stocks found</h3>
              <p className="text-slate-500">
                No stocks match your search for "{searchQuery}". Try a different search term.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State for Search */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading stocks...</p>
          </div>
        )}

        {/* Loading More State */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-slate-600">Loading more stocks...</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default StockList