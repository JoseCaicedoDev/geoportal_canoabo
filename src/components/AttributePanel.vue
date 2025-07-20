<template>
  <div
    v-show="store.attributePanelVisible"
    class="bg-geo-background border-t border-geo-border shadow-lg"
    style="height: 300px;"
    role="region"
    aria-label="Panel de atributos"
  >
    <!-- Header -->
    <AttributeHeader
      :title="headerTitle"
      :layer-display-name="displayName"
      :total-count="totalCount"
      :filtered-count="filteredCount"
      :selected-count="selectedCount"
      :export-button-text="exportButtonText"
      @export-attributes="handleExportAll"
      @close-panel="closePanel"
    />

    <!-- Controls -->
    <AttributeControls
      :search-term="searchTerm"
      :records-per-page="pagination.itemsPerPage"
      :total-results="searchResults.value?.total || 0"
      @search-change="handleSearchChange"
      @records-change="handleRecordsPerPageChange"
    />

    <!-- Table Container -->
    <div class="p-4 pt-0">
      <div class="bg-geo-hover/50 rounded-lg overflow-auto" style="height: 180px;">
        <AttributeTable
          :attributes="paginatedAttributes"
          :columns="tableColumns"
          :loading="isLoading"
          :search-term="searchTerm"
          :sort-by="sorting.sortBy.value"
          :sort-order="sorting.sortOrder.value"
          :current-page="pagination.currentPage.value"
          :records-per-page="pagination.itemsPerPage.value"
          :selected-row-index="selectedRowIndex"
          :texture-colors="textureColors"
          :loading-text="$t('attributes.loading')"
          :empty-text="$t('attributes.noData')"
          @sort="handleSort"
          @row-select="handleRowSelect"
        />
      </div>
    </div>

    <!-- Footer -->
    <AttributeFooter
      :total-records="layerData.length"
      :filtered-records="searchResults.value?.total || 0"
      :selected-count="attributeData.selectedCount.value"
      :exporting="exportComposable.exporting.value"
      :refreshing="refreshing"
      :last-refresh="attributeData.lastRefresh.value"
      :status-message="statusMessage"
      @clear-selection="handleClearSelection"
      @export-selected="handleExportSelected"
      @export-all="handleExportAll"
      @refresh-data="handleRefreshData"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLayerStore } from '@/stores/layerStore'
import { layerService } from '@/services/layerService'
import {
  AttributeHeader,
  AttributeControls,
  AttributeTable,
  AttributeFooter
} from '@/components/attributes'
import {
  useAttributeData,
  useAttributePagination,
  useAttributeSearch,
  useAttributeSorting,
  useAttributeExport,
  useExcelExport
} from '@/composables'

// Store
const store = useLayerStore()
const { t } = useI18n()

// Legacy state (maintaining compatibility)
const layerData = ref([])
const isLoading = ref(false)
const selectedRowIndex = ref(null)
const refreshing = ref(false)
const statusMessage = ref('')

// Composables
const attributeData = useAttributeData()
const searchComposable = useAttributeSearch(
  computed(() => layerData.value),
  computed(() => tableColumns.value || [])
)
const sorting = useAttributeSorting(searchComposable.filteredData)
const pagination = useAttributePagination(
  computed(() => sorting.sortedData.value.length),
  10
)
const exportComposable = useAttributeExport()
const excelExport = useExcelExport()

// Computed properties
const layerFields = computed(() => {
  if (layerData.value.length === 0) return []

  return Object.keys(layerData.value[0]).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    sortable: true,
    type: typeof layerData.value[0][key] === 'number' ? 'number' : 'string'
  }))
})

const displayName = computed(() => {
  if (!store.currentLayerId) return ''
  return layerService.getLayerDisplayName(store.currentLayerId)
})

const headerTitle = computed(() =>
  `${t('attributes.title')} - ${displayName.value}`
)

const exportButtonText = computed(() =>
  t('attributes.export')
)

// Contadores para el header
const totalCount = computed(() => layerData.value.length)

const selectedCount = computed(() => {
  // Si hay una fila seleccionada, mostrar 1, sino 0
  return selectedRowIndex.value !== null ? 1 : 0
})

// Si hay filtro activo, mostrar total filtrado en lugar del total general
const displayTotalCount = computed(() => {
  if (searchTerm.value && searchTerm.value.trim()) {
    return searchResults.value?.total || 0
  }
  return totalCount.value
})

// Conteo de registros filtrados
const filteredCount = computed(() => {
  const hasFilter = searchTerm.value && searchTerm.value.trim()
  if (!hasFilter) return undefined

  return searchResults.value?.total || 0
})

const tableColumns = computed(() => {
  return layerFields.value.map(field => ({
    key: field.key,
    label: field.label,
    type: field.type
  }))
})

const searchTerm = computed({
  get: () => searchComposable.searchTerm.value,
  set: (value) => searchComposable.setSearchTerm(value)
})

const searchResults = computed(() => searchComposable.searchResults.value || { total: 0, hasResults: false, isFiltered: false })

const paginatedAttributes = computed(() => {
  const sorted = sorting.sortedData.value
  const start = pagination.startIndex.value
  const end = pagination.endIndex.value
  return sorted.slice(start, end)
})

const textureColors = computed(() => {
  // Return texture colors if available in layer configuration
  return {}
})

// Methods
const loadLayerData = async (layerId) => {
  if (!layerId) {
    layerData.value = []
    return
  }

  isLoading.value = true
  try {
    const data = await layerService.getLayerData(layerId)
    layerData.value = data
  } catch (error) {
    console.error('Error loading layer data:', error)
    layerData.value = []
    showStatusMessage('Error al cargar los datos', 'error')
  } finally {
    isLoading.value = false
  }
}

const closePanel = () => {
  store.attributePanelVisible = false
  store.currentLayerId = null
  resetPagination()
}

const resetPagination = () => {
  pagination.resetPagination()
  searchComposable.clearAllFilters()
  sorting.clearSorting()
  selectedRowIndex.value = null
  clearMapSelection()
}

const handleSearchChange = (term) => {
  searchComposable.setSearchTerm(term)
  pagination.resetPagination()
}

const handleRecordsPerPageChange = (records) => {
  pagination.setRecordsPerPage(records)
}

const handleSort = (columnKey) => {
  sorting.sortByColumn(columnKey)
  pagination.resetPagination()
}

const handleRowSelect = (row, index) => {
  selectedRowIndex.value = selectedRowIndex.value === index ? null : index

  // Select feature on map when row is clicked
  if (selectedRowIndex.value === index) {
    selectFeatureOnMap(row)
  } else {
    // Clear selection if row is deselected
    clearMapSelection()
  }
}

const selectFeatureOnMap = async (row) => {
  try {
    // Try different possible ID fields
    const featureId = row.id || row.fid || row.objectid || row.gid
    
    // Get the name value for the tooltip
    const nameValue = getNameValue(row)

    if (featureId && store.currentLayerId) {
      const success = await layerService.selectFeatureOnMap(store.currentLayerId, featureId, nameValue)

      if (success) {
        showStatusMessage(`Feature ${featureId} seleccionado en el mapa`)
      } else {
        showStatusMessage('No se pudo localizar el feature en el mapa', 'warning')
      }
    } else {
      showStatusMessage('No se encontró ID del feature para seleccionar', 'warning')
    }
  } catch (error) {
    console.error('Error selecting feature on map:', error)
    showStatusMessage('Error al seleccionar feature en el mapa', 'error')
  }
}

const getNameValue = (row) => {
  // Buscar el campo nombre o name en el registro
  return row.nombre || row.name || row.Name || row.NOMBRE || ''
}

const clearMapSelection = async () => {
  try {
    const { mapService } = await import('@/services/mapService.js')
    mapService.clearSelection()
  } catch (error) {
    console.error('Error clearing map selection:', error)
  }
}

const handleClearSelection = () => {
  selectedRowIndex.value = null
  clearMapSelection()
  showStatusMessage(t('attributes.messages.selectionCleared'))
}

const handleExportSelected = async () => {
  if (selectedRowIndex.value === null) {
    showStatusMessage(t('attributes.messages.noDataSelected'), 'error')
    return
  }

  try {
    const selectedData = [paginatedAttributes.value[selectedRowIndex.value]]
    const layerName = displayName.value || 'datos'

    const result = excelExport.exportSelectedData(
      selectedData,
      tableColumns.value,
      layerName
    )

    if (result.success) {
      showStatusMessage(result.message)
    } else {
      showStatusMessage(result.message, 'error')
    }
  } catch (error) {
    showStatusMessage(t('attributes.messages.exportError'), 'error')
  }
}

const handleExportAll = async () => {
  try {
    if (!layerData.value.length) {
      showStatusMessage(t('attributes.messages.noDataToExport'), 'error')
      return
    }

    const layerName = displayName.value || 'datos'
    const result = excelExport.exportAllData(
      layerData.value,
      tableColumns.value,
      layerName
    )

    if (result.success) {
      showStatusMessage(result.message)
    } else {
      showStatusMessage(result.message, 'error')
    }
  } catch (error) {
    showStatusMessage(t('attributes.messages.exportAllError'), 'error')
  }
}

const handleRefreshData = async () => {
  refreshing.value = true
  try {
    await loadLayerData(store.currentLayerId)
    showStatusMessage(t('attributes.refresh'))
  } catch (error) {
    showStatusMessage(t('attributes.messages.exportAllError'), 'error')
  } finally {
    refreshing.value = false
  }
}

// Legacy methods (maintaining compatibility)
const exportAttributes = async () => {
  if (!store.currentLayerId) return
  try {
    const result = await layerService.exportLayer(store.currentLayerId)
    const a = document.createElement('a')
    const url = window.URL.createObjectURL(result.blob)
    a.href = url
    a.download = result.fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    showStatusMessage(t('attributes.refresh'))
  } catch (error) {
    console.error('Error al exportar:', error)
    showStatusMessage(t('attributes.messages.exportAllError'), 'error')
  }
}

const zoomToFeature = (featureId) => {
  if (!store.currentLayerId) return
  layerService.zoomToFeature(store.currentLayerId, featureId)
}

const showStatusMessage = (message, type = 'info') => {
  statusMessage.value = message
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// Watchers
watch(() => store.currentLayerId, async (newLayerId) => {
  await loadLayerData(newLayerId)
  resetPagination()
}, { immediate: true })

watch(() => store.attributePanelVisible, (visible) => {
  if (!visible) {
    resetPagination()
    statusMessage.value = ''
  }
})

// Lifecycle
onMounted(() => {
  if (store.currentLayerId) {
    loadLayerData(store.currentLayerId)
  }
})
</script>
