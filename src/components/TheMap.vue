<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { mapService } from '@/services/mapService'
import { layerService } from '@/services/layerService'
import { useLayerStore } from '@/stores/layerStore'

// Microcomponentes del mapa
import MapContainer from './map/MapContainer.vue'
import MapControls from './map/MapControls.vue'
import MapInfo from './map/MapInfo.vue'

// Composables especializados
import { useMapEvents } from '@/composables/useMapEvents'
import { useMapControls } from '@/composables/useMapControls'
import { useMapLayers } from '@/composables/useMapLayers'

const { isDarkMode } = useDarkMode()
const store = useLayerStore()

// Configuración inicial del mapa (Región de Canoabo, Carabobo, Venezuela)
const INITIAL_CENTER = [10.3316, -68.2833] // Coordenadas aproximadas de Canoabo
const INITIAL_ZOOM = 12

// Composables
const {
  mapCoordinates,
  scale,
  isFullscreen,
  handleMouseMove,
  setupMapEvents,
  cleanupMapEvents
} = useMapEvents()

const {
  zoomIn,
  zoomOut,
  zoomToHome,
  toggleFullscreen
} = useMapControls(mapService)

const {
  setupLayerWatcher
} = useMapLayers(mapService, layerService, store)

// Referencias
const mapRef = ref(null)
let layerWatcherStop = null

// Event handlers
const handleMapReady = async (containerElement) => {
  mapRef.value = containerElement
  await initializeMap()
}

const handleMapMouseMove = (event) => {
  handleMouseMove(event, mapService)
}

// Métodos de inicialización
const initializeMap = async () => {
  await nextTick()

  if (!mapRef.value) return

  try {
    // Inicializar el mapa usando el servicio
    const map = mapService.initializeMap(mapRef.value, {
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    })

    // Configurar eventos del mapa
    setupMapEvents(map, mapService)

    // Configurar watcher para capas
    layerWatcherStop = setupLayerWatcher()

    // Exponer mapService globalmente para otros componentes
    window.mapService = mapService
  } catch (error) {
    console.error('Error inicializando el mapa:', error)
  }
}

onUnmounted(() => {
  // Limpiar eventos del mapa
  if (mapService.map) {
    cleanupMapEvents(mapService.map)
  }

  // Detener watcher de capas
  if (layerWatcherStop) {
    layerWatcherStop()
  }

  // Destruir el mapa
  mapService.destroy()

})
</script>

<template>
  <main
    class="h-full relative"
    role="main"
    aria-label="Mapa geográfico interactivo"
  >
    <!-- Map Container -->
    <MapContainer
      :center="INITIAL_CENTER"
      :zoom="INITIAL_ZOOM"
      map-aria-label="Mapa de la región de Canoabo, Carabobo, Venezuela"
      @map-ready="handleMapReady"
      @mouse-move="handleMapMouseMove"
    />

    <!-- Map Controls -->
    <MapControls
      :is-fullscreen="isFullscreen"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @zoom-to-home="zoomToHome"
      @toggle-fullscreen="toggleFullscreen"
    />

    <!-- Map Information -->
    <MapInfo
      :scale="scale"
      :coordinates="mapCoordinates"
    />
  </main>
</template>

<style scoped>
/* Estilos específicos para el componente de mapa */

/* Asegurar que los controles de Leaflet se vean correctamente */
:deep(.leaflet-control-container) {
  pointer-events: auto;
}

/* Estilos para popups de Leaflet */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-tip) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Ajustar colores de popup en modo oscuro */
.dark :deep(.leaflet-popup-content-wrapper) {
  background-color: #374151;
  color: #f3f4f6;
}

.dark :deep(.leaflet-popup-tip) {
  background-color: #374151;
}
</style>