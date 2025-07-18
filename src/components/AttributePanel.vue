<script setup>
import { ref, computed, watch } from 'vue'
import { useLayerStore } from '@/stores/layerStore'
import { layerService } from '@/services/layerService'

const store = useLayerStore()
const searchTerm = ref('')
const recordsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('')
const sortDirection = ref('asc')

const layerFields = computed(() => {
  if (!store.currentLayerId) return []
  return layerService.getLayerFields(store.currentLayerId)
})

const rawLayerData = computed(() => {
  if (!store.currentLayerId) return []
  return layerService.getLayerData(store.currentLayerId)
})

const filteredData = computed(() => {
  if (!searchTerm.value) return rawLayerData.value
  return layerService.filterLayerData(store.currentLayerId, searchTerm.value)
})

const sortedData = computed(() => {
  if (!sortField.value) return filteredData.value
  return layerService.sortLayerData(filteredData.value, sortField.value, sortDirection.value)
})

const displayName = computed(() => {
  if (!store.currentLayerId) return ''
  return layerService.getLayerDisplayName(store.currentLayerId)
})

const closePanel = () => {
  store.attributePanelVisible = false
  store.currentLayerId = null
  resetPagination()
}

const exportAttributes = async () => {
  if (!store.currentLayerId) return
  try {
    const result = await layerService.exportLayer(store.currentLayerId)
    // Crear descarga del archivo
    const a = document.createElement('a')
    const url = window.URL.createObjectURL(result.blob)
    a.href = url
    a.download = result.fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error al exportar:', error)
  }
}

const clearSelection = () => {
  // TO-DO: Implementar limpieza de selección
  console.log('Limpiando selección...')
}

const zoomToFeature = (featureId) => {
  if (!store.currentLayerId) return
  layerService.zoomToFeature(store.currentLayerId, featureId)
}

const handleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'fas fa-sort text-geo-text/40'
  return sortDirection.value === 'asc'
    ? 'fas fa-sort-up text-geo-primary'
    : 'fas fa-sort-down text-geo-primary'
}

const totalPages = computed(() => {
  return Math.ceil(sortedData.value.length / recordsPerPage.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * recordsPerPage.value
  const end = start + recordsPerPage.value
  return sortedData.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const resetPagination = () => {
  currentPage.value = 1
  searchTerm.value = ''
  sortField.value = ''
  sortDirection.value = 'asc'
}

// Resetear paginación cuando cambie la capa
watch(() => store.currentLayerId, () => {
  resetPagination()
})

// Resetear página cuando cambie el término de búsqueda
watch(searchTerm, () => {
  currentPage.value = 1
})
</script>

<template>
  <div
    v-show="store.attributePanelVisible"
    class="bg-geo-background border-t border-geo-border shadow-lg"
    style="height: 300px;"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-geo-border bg-geo-hover/50">
      <h3 class="font-semibold text-geo-text flex items-center">
        <i class="fas fa-table mr-2 text-geo-accent"></i>
        Tabla de Atributos
        <span class="ml-2 text-sm text-geo-text/60 font-normal">
          - {{ displayName }}
        </span>
      </h3>
      <div class="flex items-center space-x-2">
        <button
          @click="exportAttributes"
          class="px-3 py-1 text-xs bg-geo-secondary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <i class="fas fa-download mr-1"></i>
          Exportar
        </button>
        <button
          @click="closePanel"
          class="p-1 text-geo-text/60 hover:text-geo-text transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="p-4">
      <div class="mb-3 flex items-center space-x-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar en los atributos..."
            class="w-full px-3 py-2 text-sm bg-geo-background border border-geo-border rounded-md focus:ring-2 focus:ring-geo-primary focus:border-transparent text-geo-text placeholder-geo-text/60"
          >
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-geo-text/60">Mostrar:</span>
          <select
            v-model="recordsPerPage"
            class="text-sm bg-geo-background border border-geo-border rounded-md px-2 py-1 text-geo-text"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-geo-hover/50 rounded-lg overflow-hidden" style="height: 180px;">
        <div class="overflow-auto h-full">
          <table class="w-full text-sm">
            <thead class="bg-geo-hover sticky top-0">
              <tr>
                <th
                  v-for="field in layerFields"
                  :key="field.key"
                  class="px-3 py-2 text-left font-medium text-geo-text hover:bg-geo-hover transition-colors"
                  :class="{ 'cursor-pointer': field.sortable }"
                  @click="field.sortable && handleSort(field.key)"
                >
                  {{ field.label }}
                  <i
                    v-if="field.sortable"
                    :class="getSortIcon(field.key)"
                    class="text-xs ml-1"
                  ></i>
                </th>
                <th class="px-3 py-2 text-left font-medium text-geo-text">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-geo-border">
              <tr
                v-for="item in paginatedData"
                :key="item.id"
                class="hover:bg-geo-hover cursor-pointer"
              >
                <td
                  v-for="field in layerFields"
                  :key="field.key"
                  class="px-3 py-2"
                  :class="field.key === 'id' ? 'text-geo-text/60' : field.key === 'nombre' ? 'text-geo-text font-medium' : 'text-geo-text/80'"
                >
                  {{ item[field.key] }}
                </td>
                <td class="px-3 py-2">
                  <button
                    @click="zoomToFeature(item.id)"
                    class="text-geo-primary hover:text-green-600 text-xs"
                    title="Zoom a elemento"
                  >
                    <i class="fas fa-search-plus"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-3 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <p class="text-xs text-geo-text/60">Fuente: Servicio WFS GeoServer</p>
          <span class="text-xs text-geo-text/60">
            Mostrando {{ paginatedData.length }} de {{ sortedData.length }} registros
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="clearSelection"
            class="px-3 py-1 text-xs bg-geo-primary text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Limpiar selección
          </button>
          <div class="flex items-center space-x-1" v-if="totalPages > 1">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-2 py-1 text-xs border border-geo-border rounded hover:bg-geo-hover disabled:opacity-50 transition-colors"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="px-2 py-1 text-xs text-geo-text">{{ currentPage }} / {{ totalPages }}</span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 text-xs border border-geo-border rounded hover:bg-geo-hover disabled:opacity-50 transition-colors"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
