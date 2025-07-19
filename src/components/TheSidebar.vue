<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLayerStore } from '@/stores/layerStore'
import { layerService } from '@/services/layerService'
import LayerContextMenu from './LayerContextMenu.vue'

const { isDarkMode } = useDarkMode()
const store = useLayerStore()
const selectedBaseLayer = ref('world-imagery')
const openAccordions = ref(new Set(['base-layers', 'data-layers'])) // Inicializar con ambos acordeones abiertos
const baseLayers = ref({})
const wfsLayerGroups = ref({})
const wfsLayers = ref({})

// Importar mapService para manejar capas base
let mapService = null

const toggleAccordion = (id) => {
  if (openAccordions.value.has(id)) {
    openAccordions.value.delete(id)
  } else {
    openAccordions.value.add(id)
  }
}

const showContextMenu = (event, layerId) => {
  store.showContextMenu(event, layerId)
}

// Cambiar capa base cuando el usuario selecciona una
const handleBaseLayerChange = (layerId) => {
  if (mapService && mapService.setBaseLayer) {
    mapService.setBaseLayer(layerId)
  }
}

// Watch para detectar cambios en la capa base seleccionada
watch(selectedBaseLayer, (newLayerId) => {
  handleBaseLayerChange(newLayerId)
})

// Funciones helper para las capas WFS
const getAllWfsLayers = () => {
  const allLayers = []
  Object.values(wfsLayerGroups.value).forEach(group => {
    allLayers.push(...group.layers)
  })
  return allLayers
}

const getLayerGroup = (layerId) => {
  return Object.values(wfsLayerGroups.value).find(group =>
    group.layers.includes(layerId)
  )
}

const getLayerColorClass = (layerId) => {
  const group = getLayerGroup(layerId)
  return group ? `text-${group.color} focus:ring-${group.color}` : 'text-geo-primary focus:ring-geo-primary'
}

const getLayerIndicatorClass = (layerId) => {
  const group = getLayerGroup(layerId)
  return group ? `w-3 h-3 bg-${group.color} rounded-full` : 'w-3 h-3 bg-geo-primary rounded-full'
}

// Ocultar menú contextual al hacer clic fuera o al cambiar de ventana
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
  const checkMapService = () => {
    if (window.mapService) {
      mapService = window.mapService
      baseLayers.value = mapService.getBaseLayers()
      // Sincronizar con la capa base actual
      selectedBaseLayer.value = mapService.getCurrentBaseLayerId()
      console.log('MapService conectado, capas base cargadas:', baseLayers.value)
      console.log('Capas WFS cargadas:', wfsLayerGroups.value)
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
  <div class="h-full bg-geo-background shadow-xl border-r border-geo-border flex flex-col dark:bg-geo-dark">
    <!-- Tabs de navegación -->
    <div class="flex border-b border-geo-border">
      <button class="flex-1 py-2 px-3 text-sm font-medium text-geo-primary border-b-2 border-geo-primary bg-geo-hover/50">
        <i class="fas fa-layer-group mr-1"></i>
        Capas
      </button>
      <button class="flex-1 py-2 px-3 text-sm font-medium text-geo-text/60 hover:text-geo-primary transition-colors">
        <i class="fas fa-chart-bar mr-1"></i>
        Análisis
      </button>
      <button class="flex-1 py-2 px-3 text-sm font-medium text-geo-text/60 hover:text-geo-primary transition-colors">
        <i class="fas fa-info-circle mr-1"></i>
        Info
      </button>
    </div>

    <!-- Contenido del sidebar -->
    <div class="flex-1 overflow-y-auto">
      <!-- Capas Base -->
        <div class="border border-geo-border rounded-lg">
          <div
            class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
            @click="toggleAccordion('base-layers')"
          >
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 bg-geo-primary rounded"></div>
              <span class="text-sm font-medium text-geo-text">Capas Base</span>
            </div>
            <i :class="[
              'fas fa-chevron-down text-geo-text/60 transform transition-transform',
              openAccordions.has('base-layers') ? 'rotate-180' : ''
            ]"></i>
          </div>
          <div
            v-show="openAccordions.has('base-layers')"
            class="border-t border-geo-border p-3 space-y-2 bg-geo-hover/50"
          >
            <label
              v-for="(layer, layerId) in baseLayers"
              :key="layerId"
              class="flex items-center space-x-3 rounded-lg hover:bg-geo-hover cursor-pointer"
            >
              <input
                type="radio"
                name="baseLayer"
                :value="layerId"
                v-model="selectedBaseLayer"
                class="text-geo-primary focus:ring-geo-primary"
              >
              <span class="text-sm text-geo-text">{{ layer.name }}</span>
            </label>
          </div>
        </div>


      <!-- Capas de Datos -->
        <div class="border border-geo-border rounded-lg">
          <div
            class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
            @click="toggleAccordion('data-layers')"
          >
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 bg-geo-secondary rounded"></div>
              <span class="text-sm font-medium text-geo-text">Capas de Datos</span>
            </div>
            <div class="flex items-center space-x-2">
              <i :class="[
                'fas fa-chevron-down text-geo-text/60 transform transition-transform',
                openAccordions.has('data-layers') ? 'rotate-180' : ''
              ]"></i>
            </div>
          </div>
          <div
            v-show="openAccordions.has('data-layers')"
            class="border-t border-geo-border p-3 bg-geo-hover/50"
          >

        <!-- Lista plana de capas WFS sin acordeones anidados -->
        <div class="space-y-2">
          <div
            v-for="layerId in getAllWfsLayers()"
            :key="layerId"
            class="flex items-center justify-between group p-2 rounded-lg hover:bg-geo-hover"
          >
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                :class="getLayerColorClass(layerId)"
                :checked="store.selectedLayers.has(layerId)"
                @change="store.toggleLayer(layerId)"
              >
              <div class="flex items-center space-x-2">
                <div :class="getLayerIndicatorClass(layerId)"></div>
                <span class="text-sm text-geo-text">{{ wfsLayers[layerId] || layerId }}</span>
              </div>
            </label>
            <div class="relative">
              <button
                class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                @click="showContextMenu($event, layerId)"
              >
                <i class="fas fa-ellipsis-v text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Menú contextual -->
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
        </div>
      </div>

    <!-- Footer -->
    <footer class="bg-geo-dark p-4 mt-auto dark:bg-geo-dark/50">
      <div class="flex flex-col items-center space-y-3">
        <div class="flex items-center space-x-2">
          <p class="text-sm text-geo-text/80">© 2024 GeoCanoabo - Powered by Gira360</p>
        </div>
        <div class="flex items-center space-x-2">
          <i class="fab fa-leaflet text-geo-primary"></i>
          <span class="text-sm text-geo-text/80">Leaflet</span>
        </div>
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <button class="text-sm text-geo-text/80 hover:text-geo-primary transition-colors">
            <i class="fas fa-download mr-1"></i>
            Descargar datos
          </button>
          <button class="text-sm text-geo-text/80 hover:text-geo-primary transition-colors">
            <i class="fas fa-share-alt mr-1"></i>
            Compartir
          </button>
          <button class="text-sm text-geo-text/80 hover:text-geo-primary transition-colors">
            <i class="fas fa-question-circle mr-1"></i>
            Ayuda
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>
