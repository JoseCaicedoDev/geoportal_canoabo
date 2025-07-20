<script setup>
import { ref } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDarkMode } = useDarkMode()
const props = defineProps({
  layerId: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const searchTerm = ref('')
const recordsPerPage = ref(10)

const layerData = {
  'rio-canoabo': [
    { id: 'RC001', nombre: 'Río Canoabo Principal', tipo: 'Río principal', area: '125.5' },
    { id: 'RC002', nombre: 'Río Canoabo Medio', tipo: 'Río principal', area: '89.2' },
    { id: 'RC003', nombre: 'Río Canoabo Bajo', tipo: 'Río principal', area: '67.8' }
  ],
  // ... más datos
}

const getLayerDisplayName = (layerId) => {
  const names = {
    'rio-canoabo': 'Río Canoabo',
    'afluentes': 'Afluentes',
    'cuenca': 'Cuenca',
    // ... más nombres
  }
  return names[layerId] || layerId
}

const filteredData = computed(() => {
  if (!props.layerId || !layerData[props.layerId]) return []
  return layerData[props.layerId].filter(item =>
    Object.values(item).some(val =>
      val.toString().toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  )
})
</script>

<template>
  <div
    v-show="isVisible"
    class="bg-geo-background border-t border-geo-border shadow-lg"
    style="height: 300px;"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-geo-border bg-geo-hover/50">
      <h3 class="font-semibold text-geo-text flex items-center">
        <i class="fas fa-table mr-2 text-geo-accent"></i>
        Tabla de Atributos
        <span class="ml-2 text-sm text-geo-text/60 font-normal">
          - {{ getLayerDisplayName(layerId) }}
        </span>
      </h3>
      <div class="flex items-center space-x-2">
        <button
          class="px-3 py-1 text-xs bg-geo-secondary text-white rounded-md hover:bg-blue-600 transition-colors"
          @click="exportAttributes"
        >
          <i class="fas fa-download mr-1"></i>
          Exportar
        </button>
        <button
          class="p-1 text-geo-text/60 hover:text-geo-text transition-colors"
          @click="$emit('close')"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Controles de búsqueda -->
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

      <!-- Tabla -->
      <div class="bg-gray-50 rounded-lg overflow-hidden" style="height: 180px;">
        <div class="overflow-auto h-full">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200">
                  ID <i class="fas fa-sort text-xs ml-1"></i>
                </th>
                <th class="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200">
                  Nombre <i class="fas fa-sort text-xs ml-1"></i>
                </th>
                <th class="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200">
                  Tipo <i class="fas fa-sort text-xs ml-1"></i>
                </th>
                <th class="px-3 py-2 text-left font-medium text-gray-700">
                  Área (km²) <i class="fas fa-sort text-xs ml-1"></i>
                </th>
                <th class="px-3 py-2 text-left font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="item in filteredData"
                :key="item.id"
                class="hover:bg-gray-100"
              >
                <td class="px-3 py-2 text-gray-600">{{ item.id }}</td>
                <td class="px-3 py-2 text-gray-900">{{ item.nombre }}</td>
                <td class="px-3 py-2 text-gray-700">{{ item.tipo }}</td>
                <td class="px-3 py-2 text-gray-700">{{ item.area }}</td>
                <td class="px-3 py-2">
                  <button
                    @click="zoomToFeature(item.id)"
                    class="text-geo-primary hover:text-green-600 text-xs"
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
          <p class="text-xs text-gray-500">Fuente: Servicio WFS GeoServer</p>
          <span class="text-xs text-gray-600">
            Mostrando {{ filteredData.length }} registros
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="clearSelection"
            class="px-3 py-1 text-xs bg-geo-primary text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Limpiar selección
          </button>
          <div class="flex items-center space-x-1">
            <button class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="px-2 py-1 text-xs text-gray-700 dark:text-gray-300">1</span>
            <button class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
