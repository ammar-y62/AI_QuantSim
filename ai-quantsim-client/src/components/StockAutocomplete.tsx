import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Building2, ChevronDown } from 'lucide-react'
import { stockService } from '@/services'
import type { StockSearchResult } from '@/services/stock'

interface StockAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function StockAutocomplete({
  value,
  onChange,
  placeholder = "Search stocks...",
  className = "",
  disabled = false
}: StockAutocompleteProps): JSX.Element {
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchStocks = async () => {
      if (value.trim().length < 1) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      try {
        setLoading(true)
        const results = await stockService.searchStocks(value)
        setSuggestions(results.slice(0, 8)) // Limit to 8 suggestions
        setIsOpen(results.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error searching stocks:', error)
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchStocks, 300)
    return () => clearTimeout(debounceTimer)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    onChange(newValue)
  }

  const handleSuggestionClick = (suggestion: StockSearchResult) => {
    onChange(suggestion.ticker)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
        {!loading && isOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto shadow-lg border-slate-200">
          <CardContent className="p-0">
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.ticker}
                  className={`px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors ${
                    index === selectedIndex ? 'bg-slate-100' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {suggestion.ticker}
                        </div>
                        <div className="text-sm text-slate-600 truncate max-w-48">
                          {suggestion.name}
                        </div>
                      </div>
                    </div>
                    {suggestion.exchange && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.exchange}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {isOpen && !loading && suggestions.length === 0 && value.trim().length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-slate-200">
          <CardContent className="p-4 text-center">
            <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No stocks found</p>
            <p className="text-xs text-slate-500">Try a different search term</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StockAutocomplete