import { ref } from 'vue'

/**
 * Composable para manejar eventos del mapa de manera reactiva
 * Siguiendo principios de Clean Code Architecture y separación de responsabilidades
 */
export function useMapEvents() {
  const mapCoordinates = ref('Mueve el cursor sobre el mapa')
  const scale = ref('1:140,000')
  const isFullscreen = ref(false)

  /**
   * Actualiza las coordenadas mostradas cuando el cursor se mueve sobre el mapa
   * @param {Object} event - Evento de Leaflet con coordenadas
   */
  const updateCoordinates = (event) => {
    if (event.latlng) {
      const lat = event.latlng.lat.toFixed(6)
      const lon = event.latlng.lng.toFixed(6)
      mapCoordinates.value = `Lat: ${lat}, Lon: ${lon}`
    }
  }

  /**
   * Actualiza la escala del mapa basada en el nivel de zoom actual
   * @param {Object} mapService - Servicio del mapa
   */
  const updateScale = (mapService) => {
    if (mapService && mapService.map) {
      scale.value = mapService.updateScale()
    }
  }

  /**
   * Maneja el evento de mouse move convirtiendo coordenadas de pantalla a geográficas
   * @param {MouseEvent} event - Evento del mouse
   * @param {Object} mapService - Servicio del mapa
   */
  const handleMouseMove = (event, mapService) => {
    if (mapService && mapService.map) {
      // Convertir coordenadas de pantalla a coordenadas del mapa
      const containerPoint = mapService.map.mouseEventToContainerPoint(event)
      const latlng = mapService.map.containerPointToLatLng(containerPoint)

      updateCoordinates({ latlng })
    }
  }

  /**
   * Configura los listeners de eventos del mapa
   * @param {Object} map - Instancia del mapa de Leaflet
   * @param {Object} mapService - Servicio del mapa
   */
  const setupMapEvents = (map, mapService) => {
    if (!map) return

    // Eventos de movimiento del mouse y zoom
    map.on('mousemove', updateCoordinates)
    map.on('zoomend', () => updateScale(mapService))
    map.on('moveend', () => updateScale(mapService))

    // Evento de pantalla completa
    map.on('fullscreenchange', () => {
      isFullscreen.value = map.isFullscreen()
    })

    // Actualizar escala inicial
    updateScale(mapService)
  }

  /**
   * Limpia los listeners de eventos del mapa
   * @param {Object} map - Instancia del mapa de Leaflet
   */
  const cleanupMapEvents = (map) => {
    if (!map) return

    map.off('mousemove', updateCoordinates)
    map.off('zoomend')
    map.off('moveend')
    map.off('fullscreenchange')
  }

  return {
    // Estado reactivo
    mapCoordinates,
    scale,
    isFullscreen,

    // Métodos públicos
    updateCoordinates,
    updateScale,
    handleMouseMove,
    setupMapEvents,
    cleanupMapEvents
  }
}
