import { ref, computed } from 'vue'

/**
 * Composable for managing table sorting functionality
 * Handles column sorting, sort direction, and sort state
 */
export function useAttributeSorting(data) {
  // State
  const sortBy = ref('')
  const sortOrder = ref('asc') // 'asc' | 'desc'
  const sortHistory = ref([]) // Track sorting history for multi-column sort

  // Computed
  const sortedData = computed(() => {
    if (!sortBy.value || !data.value.length) {
      return data.value
    }

    return [...data.value].sort((a, b) => {
      const aValue = a[sortBy.value]
      const bValue = b[sortBy.value]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) {
        if (bValue === null || bValue === undefined) return 0
        return sortOrder.value === 'asc' ? 1 : -1
      }
      if (bValue === null || bValue === undefined) {
        return sortOrder.value === 'asc' ? -1 : 1
      }

      // Determine comparison based on data type
      let comparison = 0

      // Check if both values are numbers
      const aNum = Number(aValue)
      const bNum = Number(bValue)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum
      }
      // Check if both values are dates
      else if (isDateString(aValue) && isDateString(bValue)) {
        const aDate = new Date(aValue)
        const bDate = new Date(bValue)
        comparison = aDate.getTime() - bDate.getTime()
      }
      // Default to string comparison
      else {
        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()
        comparison = aStr.localeCompare(bStr, 'es-ES', {
          numeric: true,
          sensitivity: 'base'
        })
      }

      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  })

  const sortState = computed(() => ({
    column: sortBy.value,
    direction: sortOrder.value,
    isActive: !!sortBy.value
  }))

  // Methods
  const sortByColumn = (columnKey) => {
    if (sortBy.value === columnKey) {
      // Toggle sort order for same column
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      // New column, default to ascending
      sortBy.value = columnKey
      sortOrder.value = 'asc'
    }

    // Update sort history
    updateSortHistory(columnKey, sortOrder.value)
  }

  const setSorting = (columnKey, direction = 'asc') => {
    sortBy.value = columnKey
    sortOrder.value = direction
    updateSortHistory(columnKey, direction)
  }

  const clearSorting = () => {
    sortBy.value = ''
    sortOrder.value = 'asc'
    sortHistory.value = []
  }

  const getSortDirection = (columnKey) => {
    if (sortBy.value !== columnKey) return 'none'
    return sortOrder.value
  }

  const getSortIcon = (columnKey) => {
    const direction = getSortDirection(columnKey)
    switch (direction) {
      case 'asc': return '▲'
      case 'desc': return '▼'
      default: return '↕'
    }
  }

  const getSortAriaSort = (columnKey) => {
    const direction = getSortDirection(columnKey)
    switch (direction) {
      case 'asc': return 'ascending'
      case 'desc': return 'descending'
      default: return 'none'
    }
  }

  const getSortAriaLabel = (columnKey) => {
    const direction = getSortDirection(columnKey)
    switch (direction) {
      case 'asc':
        return `Ordenado ascendente por ${columnKey}. Clic para orden descendente`
      case 'desc':
        return `Ordenado descendente por ${columnKey}. Clic para orden ascendente`
      default:
        return `Ordenar por ${columnKey}`
    }
  }

  // Multi-column sorting (future enhancement)
  const addSecondarySorting = (columnKey, direction = 'asc') => {
    const existingIndex = sortHistory.value.findIndex(s => s.column === columnKey)
    if (existingIndex !== -1) {
      sortHistory.value[existingIndex].direction = direction
    } else {
      sortHistory.value.push({ column: columnKey, direction })
    }
  }

  const removeSecondarySorting = (columnKey) => {
    sortHistory.value = sortHistory.value.filter(s => s.column !== columnKey)
  }

  const clearSecondarySorting = () => {
    sortHistory.value = []
  }

  // Helper functions
  const updateSortHistory = (columnKey, direction) => {
    // Keep track of recent sorts for potential multi-column sorting
    const maxHistory = 3
    sortHistory.value = [
      { column: columnKey, direction },
      ...sortHistory.value
        .filter(s => s.column !== columnKey)
        .slice(0, maxHistory - 1)
    ]
  }

  const isDateString = (value) => {
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return !isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/) !== null
  }

  // Determine appropriate sort type for a column
  const getColumnSortType = (columnKey, data) => {
    if (!data.length) return 'string'

    const sampleValues = data
      .slice(0, 10)
      .map(row => row[columnKey])
      .filter(val => val !== null && val !== undefined && val !== '')

    if (!sampleValues.length) return 'string'

    // Check if all values are numbers
    if (sampleValues.every(val => !isNaN(Number(val)))) {
      return 'number'
    }

    // Check if all values are dates
    if (sampleValues.every(val => isDateString(val))) {
      return 'date'
    }

    return 'string'
  }

  return {
    // State
    sortBy,
    sortOrder,
    sortHistory,

    // Computed
    sortedData,
    sortState,

    // Methods
    sortByColumn,
    setSorting,
    clearSorting,
    getSortDirection,
    getSortIcon,
    getSortAriaSort,
    getSortAriaLabel,
    addSecondarySorting,
    removeSecondarySorting,
    clearSecondarySorting,
    getColumnSortType
  }
}
