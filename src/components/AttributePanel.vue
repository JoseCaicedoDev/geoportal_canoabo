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
      :export-button-text="exportButtonText"
      @export-attributes="handleExportAll"
      @close-panel="closePanel"
    />

    <!-- Controls -->
    <AttributeControls
      :search-term="searchTerm"
      :records-per-page="pagination.itemsPerPage"
      :total-results="searchResults.total"
      @search-change="handleSearchChange"
      @records-change="handleRecordsPerPageChange"
    />

    <!-- Table Container -->
    <div class="p-4 pt-0">
      <div class="bg-geo-hover/50 rounded-lg overflow-hidden" style="height: 180px;">
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
          :loading-text="'Cargando datos...'"
          :empty-text="'No hay datos para mostrar'"
          @sort="handleSort"
          @row-select="handleRowSelect"
        />
      </div>
    </div>

    <!-- Footer -->
    <AttributeFooter
      :total-records="layerData.length"
      :filtered-records="searchResults.total"
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
  useAttributeExport
} from '@/composables'

// Store
const store = useLayerStore()

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
  `Tabla de Atributos - ${displayName.value}`
)

const exportButtonText = computed(() =>
  `Exportar (${layerData.value.length})`
)

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

const searchResults = computed(() => searchComposable.searchResults.value)

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
    console.log('Loading data for layer:', layerId)
    const data = await layerService.getLayerData(layerId)
    layerData.value = data
    console.log('Loaded data:', data)
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
  // Zoom to feature if available
  if (row.id) {
    zoomToFeature(row.id)
  }
}

const handleClearSelection = () => {
  selectedRowIndex.value = null
  showStatusMessage('Selección limpiada')
}

const handleExportSelected = async () => {
  if (selectedRowIndex.value === null) return

  try {
    const selectedData = [paginatedAttributes.value[selectedRowIndex.value]]
    const filename = exportComposable.getSuggestedFilename(
      store.currentLayerId,
      'selected_attributes'
    )

    await exportComposable.exportToCSV(selectedData, filename, tableColumns.value)
    showStatusMessage('Selección exportada correctamente')
  } catch (error) {
    showStatusMessage('Error al exportar la selección', 'error')
  }
}

const handleExportAll = async () => {
  try {
    await exportAttributes()
  } catch (error) {
    showStatusMessage('Error al exportar los datos', 'error')
  }
}

const handleRefreshData = async () => {
  refreshing.value = true
  try {
    await loadLayerData(store.currentLayerId)
    showStatusMessage('Datos actualizados correctamente')
  } catch (error) {
    showStatusMessage('Error al actualizar los datos', 'error')
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
    showStatusMessage('Datos exportados correctamente')
  } catch (error) {
    console.error('Error al exportar:', error)
    showStatusMessage('Error al exportar los datos', 'error')
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
  console.log('Current layer changed:', newLayerId)
  await loadLayerData(newLayerId)
  resetPagination()
}, { immediate: true })

watch(() => store.attributePanelVisible, (visible) => {
  console.log('AttributePanel visibility changed:', visible, 'Current layer:', store.currentLayerId)
  if (!visible) {
    resetPagination()
    statusMessage.value = ''
  }
})

// Lifecycle
onMounted(() => {
  console.log('AttributePanel mounted, current layer:', store.currentLayerId)
  if (store.currentLayerId) {
    loadLayerData(store.currentLayerId)
  }
})
</script>
