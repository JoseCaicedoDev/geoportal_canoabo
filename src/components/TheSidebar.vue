<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLayerStore } from '@/stores/layerStore'
import { layerService } from '@/services/layerService'

// Microcomponentes
import SidebarTabs from './sidebar/SidebarTabs.vue'
import BaseLayerSelector from './sidebar/BaseLayerSelector.vue'
import DataLayersPanel from './sidebar/DataLayersPanel.vue'
import SidebarFooter from './sidebar/SidebarFooter.vue'
import LayerContextMenu from './LayerContextMenu.vue'

const { isDarkMode } = useDarkMode()
const store = useLayerStore()

// Estado reactivo
const activeTab = ref('layers')
const selectedBaseLayer = ref('world-imagery')
const baseLayers = ref({})
const wfsLayerGroups = ref({})
const wfsLayers = ref({})

// Configuración de tabs
const sidebarTabs = [
  { id: 'layers', label: 'Capas', icon: 'fas fa-layer-group' },
  { id: 'analysis', label: 'Análisis', icon: 'fas fa-chart-bar' },
  { id: 'info', label: 'Info', icon: 'fas fa-info-circle' }
]

// Importar mapService para manejar capas base
let mapService = null

// Event handlers
const handleTabChange = (tabId) => {
  activeTab.value = tabId
}

const handleBaseLayerChange = (layerId) => {
  selectedBaseLayer.value = layerId
  if (mapService && mapService.setBaseLayer) {
    mapService.setBaseLayer(layerId)
  }
}

const handleLayerToggle = async (layerId) => {
  const isCurrentlySelected = store.selectedLayers.has(layerId)

  if (isCurrentlySelected) {
    // Quitar la capa del mapa
    if (mapService && mapService.removeLayer) {
      mapService.removeLayer(layerId)
    }
    store.toggleLayer(layerId) // Actualizar el store
  } else {
    // Agregar la capa al mapa
    if (mapService && mapService.hasLayer && !mapService.hasLayer(layerId)) {
      // Si la capa no existe en el mapa, cargarla primero
      try {
        const layerConfig = layerService.getLayerConfig(layerId)
        if (layerConfig && layerConfig.url) {
          const options = createLayerOptions(layerId)
          await mapService.addWFSLayer(layerId, layerConfig.url, options)
          mapService.addLayer(layerId)
        }
      } catch (error) {
        console.error(`Error al cargar la capa ${layerId}:`, error)
        return // No actualizar el store si hay error
      }
    } else {
      // Si la capa ya existe, solo agregarla al mapa
      if (mapService && mapService.addLayer) {
        mapService.addLayer(layerId)
      }
    }

    store.toggleLayer(layerId) // Actualizar el store
  }
}

const handleContextMenu = (event, layerId) => {
  store.showContextMenu(event, layerId)
}

// Helper para crear opciones de capa
const createLayerOptions = (layerId) => {
  const baseOptions = {
    onEachFeature: (feature, layer) => {
      // Popup básico para mostrar propiedades
      let popupContent = `<div class="font-semibold mb-2 text-geo-primary">${wfsLayers.value[layerId] || layerId}</div>`
      const props = feature.properties

      // Mostrar las primeras propiedades más relevantes
      const relevantProps = ['nombre', 'tipo', 'textura', 'h1_text', 'area']
      relevantProps.forEach(prop => {
        if (props[prop]) {
          popupContent += `<div><strong>${prop}:</strong> ${props[prop]}</div>`
        }
      })

      // Agregar otras propiedades si hay espacio
      let count = 0
      for (const [key, value] of Object.entries(props)) {
        if (!relevantProps.includes(key) && value !== null && value !== '' && count < 3) {
          popupContent += `<div><strong>${key}:</strong> ${value}</div>`
          count++
        }
      }

      layer.bindPopup(popupContent)
    }
  }

  // Para suelos, no pasamos el style para permitir que mapService maneje los colores
  if (layerId === 'suelos-wfs') {
    return baseOptions
  }

  // Para otras capas, incluir el estilo
  const layerConfig = layerService.getLayerConfig(layerId)
  return {
    ...baseOptions,
    style: layerConfig.style
  }
}

// Watch para detectar cambios en la capa base seleccionada
watch(selectedBaseLayer, (newLayerId) => {
  handleBaseLayerChange(newLayerId)
})

// Función para cargar capas por defecto
const loadDefaultLayers = async () => {
  const defaultLayers = ['suelos-wfs', 'perimetro-wfs']

  for (const layerId of defaultLayers) {
    if (mapService && mapService.hasLayer && !mapService.hasLayer(layerId)) {
      try {
        const layerConfig = layerService.getLayerConfig(layerId)
        if (layerConfig && layerConfig.url) {
          const options = createLayerOptions(layerId)
          await mapService.addWFSLayer(layerId, layerConfig.url, options)
          mapService.addLayer(layerId)
        }
      } catch (error) {
        console.error(`Error al cargar la capa por defecto ${layerId}:`, error)
      }
    }
  }

  // Ajustar vista a las capas cargadas después de un breve delay
  setTimeout(() => {
    if (mapService && mapService.zoomToHome) {
      mapService.zoomToHome()
    }
  }, 1000)
}// Ocultar menú contextual al hacer clic fuera o al cambiar de ventana
const handleClickOutside = (event) => {
  if (!event.target.closest('.context-menu')) {
    store.hideContextMenu()
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('blur', store.hideContextMenu)

  // Cargar capas WFS del layerService
  wfsLayerGroups.value = layerService.getLayerGroups()
  wfsLayers.value = layerService.getLayerDisplayNames()

  // Intentar obtener mapService con reintentos
  const checkMapService = async () => {
    if (window.mapService) {
      mapService = window.mapService
      baseLayers.value = mapService.getBaseLayers()
      // Sincronizar con la capa base actual
      selectedBaseLayer.value = mapService.getCurrentBaseLayerId()
      // Cargar capas por defecto una vez que mapService esté disponible
      await loadDefaultLayers()
    } else {
      // Reintentar después de un breve delay
      setTimeout(checkMapService, 100)
    }
  }

  checkMapService()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('blur', store.hideContextMenu)
})
</script>

<template>
  <aside
    class="h-full bg-geo-background shadow-xl border-r border-geo-border flex flex-col dark:bg-geo-dark"
    role="complementary"
    aria-label="Panel lateral de navegación y capas"
  >
    <!-- Navigation Tabs -->
    <SidebarTabs
      :active-tab="activeTab"
      :tabs="sidebarTabs"
      @tab-change="handleTabChange"
    />

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto" role="main">
      <!-- Layers Tab Content -->
      <div v-show="activeTab === 'layers'" class="p-3 space-y-4">
        <!-- Base Layers -->
        <BaseLayerSelector
          :base-layers="baseLayers"
          :selected-base-layer="selectedBaseLayer"
          :initially-open="false"
          @base-layer-change="handleBaseLayerChange"
        />

        <!-- Data Layers -->
        <DataLayersPanel
          :wfs-layer-groups="wfsLayerGroups"
          :wfs-layers="wfsLayers"
          :selected-layers="store.selectedLayers"
          :layer-service="layerService"
          :initially-open="true"
          @layer-toggle="handleLayerToggle"
          @context-menu="handleContextMenu"
        />

        <!-- Context Menu -->
        <LayerContextMenu
          v-if="store.activeContextMenu"
          :show="!!store.activeContextMenu"
          :layerId="store.activeContextMenu?.layerId"
          :position="{
            x: store.activeContextMenu?.x,
            y: store.activeContextMenu?.y
          }"
          class="context-menu"
        />
      </div>

      <!-- Analysis Tab Content -->
      <div v-show="activeTab === 'analysis'" class="p-3">
        <div class="text-center text-gray-600 dark:text-gray-400 py-8">
          <i class="fas fa-chart-bar text-4xl mb-4"></i>
          <p>Herramientas de análisis próximamente</p>
        </div>
      </div>

      <!-- Info Tab Content -->
      <div v-show="activeTab === 'info'" class="p-3">
        <div class="text-center text-gray-600 dark:text-gray-400 py-8">
          <i class="fas fa-info-circle text-4xl mb-4"></i>
          <p>Información del proyecto próximamente</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <SidebarFooter />
  </aside>
</template>
