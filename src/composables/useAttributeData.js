import { ref, computed, watch } from 'vue'

/**
 * Composable for managing attribute data state and operations
 * Handles data fetching, filtering, and manipulation
 */
export function useAttributeData() {
  // State
  const attributes = ref([])
  const columns = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedRows = ref(new Set())
  const lastRefresh = ref(null)

  // Computed
  const hasData = computed(() => attributes.value.length > 0)
  const selectedCount = computed(() => selectedRows.value.size)
  const selectedItems = computed(() =>
    attributes.value.filter((_, index) => selectedRows.value.has(index))
  )

  // Methods
  const loadAttributes = async (layerName) => {
    loading.value = true
    error.value = null

    try {
      // This would be replaced with actual service call
      // const data = await layerService.getLayerAttributes(layerName)
      // For now, we'll keep the existing logic structure

      attributes.value = [] // Will be populated by service
      columns.value = [] // Will be populated by service
      lastRefresh.value = new Date()
    } catch (err) {
      error.value = err.message || 'Error al cargar los atributos'
    } finally {
      loading.value = false
    }
  }

  const clearData = () => {
    attributes.value = []
    columns.value = []
    selectedRows.value.clear()
    error.value = null
  }

  const selectRow = (index) => {
    if (selectedRows.value.has(index)) {
      selectedRows.value.delete(index)
    } else {
      selectedRows.value.add(index)
    }
  }

  const selectAllRows = () => {
    if (selectedRows.value.size === attributes.value.length) {
      selectedRows.value.clear()
    } else {
      selectedRows.value = new Set(attributes.value.map((_, index) => index))
    }
  }

  const clearSelection = () => {
    selectedRows.value.clear()
  }

  const refreshData = () => {
    // Will trigger reload of current layer data
    lastRefresh.value = new Date()
  }

  return {
    // State
    attributes,
    columns,
    loading,
    error,
    selectedRows,
    lastRefresh,

    // Computed
    hasData,
    selectedCount,
    selectedItems,

    // Methods
    loadAttributes,
    clearData,
    selectRow,
    selectAllRows,
    clearSelection,
    refreshData
  }
}
