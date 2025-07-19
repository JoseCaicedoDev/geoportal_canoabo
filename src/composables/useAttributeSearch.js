import { ref, computed, watch } from 'vue'

/**
 * Composable for managing search and filtering functionality
 * Handles text search, column filtering, and filter state
 */
export function useAttributeSearch(data, columns) {
  // State
  const searchTerm = ref('')
  const columnFilters = ref(new Map())
  const caseSensitive = ref(false)
  const exactMatch = ref(false)

  // Computed
  const hasActiveFilters = computed(() =>
    searchTerm.value.length > 0 || columnFilters.value.size > 0
  )

  const filteredData = computed(() => {
    let filtered = data.value

    // Apply global search
    if (searchTerm.value) {
      const searchValue = caseSensitive.value
        ? searchTerm.value
        : searchTerm.value.toLowerCase()

      filtered = filtered.filter(row => {
        return columns.value.some(column => {
          const cellValue = String(row[column.key] || '')
          const value = caseSensitive.value ? cellValue : cellValue.toLowerCase()

          return exactMatch.value
            ? value === searchValue
            : value.includes(searchValue)
        })
      })
    }

    // Apply column-specific filters
    if (columnFilters.value.size > 0) {
      filtered = filtered.filter(row => {
        return Array.from(columnFilters.value.entries()).every(([columnKey, filterValue]) => {
          const cellValue = String(row[columnKey] || '')
          const value = caseSensitive.value ? cellValue : cellValue.toLowerCase()
          const filter = caseSensitive.value ? filterValue : filterValue.toLowerCase()

          return exactMatch.value
            ? value === filter
            : value.includes(filter)
        })
      })
    }

    return filtered
  })

  const searchResults = computed(() => ({
    total: filteredData.value.length,
    hasResults: filteredData.value.length > 0,
    isFiltered: hasActiveFilters.value
  }))

  // Methods
  const setSearchTerm = (term) => {
    searchTerm.value = term
  }

  const clearSearch = () => {
    searchTerm.value = ''
  }

  const setColumnFilter = (columnKey, value) => {
    if (value && value.trim()) {
      columnFilters.value.set(columnKey, value.trim())
    } else {
      columnFilters.value.delete(columnKey)
    }
  }

  const clearColumnFilter = (columnKey) => {
    columnFilters.value.delete(columnKey)
  }

  const clearAllFilters = () => {
    searchTerm.value = ''
    columnFilters.value.clear()
  }

  const getColumnFilter = (columnKey) => {
    return columnFilters.value.get(columnKey) || ''
  }

  const toggleCaseSensitive = () => {
    caseSensitive.value = !caseSensitive.value
  }

  const toggleExactMatch = () => {
    exactMatch.value = !exactMatch.value
  }

  // Get unique values for a column (useful for dropdowns)
  const getColumnUniqueValues = (columnKey) => {
    const values = new Set()
    data.value.forEach(row => {
      const value = row[columnKey]
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value))
      }
    })
    return Array.from(values).sort()
  }

  // Highlight search terms in text (returns array of text parts and highlights)
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return [{ text, highlighted: false }]

    const search = caseSensitive.value ? searchTerm : searchTerm.toLowerCase()
    const content = caseSensitive.value ? text : text.toLowerCase()

    if (exactMatch.value) {
      return content === search
        ? [{ text, highlighted: true }]
        : [{ text, highlighted: false }]
    }

    const parts = []
    let lastIndex = 0
    let index = content.indexOf(search)

    while (index !== -1) {
      // Add text before match
      if (index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, index),
          highlighted: false
        })
      }

      // Add highlighted match
      parts.push({
        text: text.slice(index, index + search.length),
        highlighted: true
      })

      lastIndex = index + search.length
      index = content.indexOf(search, lastIndex)
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        highlighted: false
      })
    }

    return parts
  }

  // Debounced search to avoid excessive filtering
  let searchTimeout = null
  const debouncedSearch = (term, delay = 300) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      setSearchTerm(term)
    }, delay)
  }

  return {
    // State
    searchTerm,
    columnFilters,
    caseSensitive,
    exactMatch,

    // Computed
    hasActiveFilters,
    filteredData,
    searchResults,

    // Methods
    setSearchTerm,
    clearSearch,
    setColumnFilter,
    clearColumnFilter,
    clearAllFilters,
    getColumnFilter,
    toggleCaseSensitive,
    toggleExactMatch,
    getColumnUniqueValues,
    highlightSearchTerm,
    debouncedSearch
  }
}
