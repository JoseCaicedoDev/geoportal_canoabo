import { ref } from 'vue'
import proj4 from 'proj4'

// Definir las proyecciones
const wgs84 = 'EPSG:4326' // WGS84 (lat/lon)
const utm19n = '+proj=utm +zone=19 +datum=WGS84 +units=m +no_defs' // EPSG:32619 - UTM Zone 19N

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
   * Convierte de WGS84 (lat/lon) a UTM Zone 19N (EPSG:32619)
   * @param {Object} event - Evento de Leaflet con coordenadas
   */
  const updateCoordinates = (event) => {
    if (event.latlng) {
      try {
        // Convertir de WGS84 a UTM Zone 19N
        const [x, y] = proj4(wgs84, utm19n, [event.latlng.lng, event.latlng.lat])

        // Formatear las coordenadas UTM con separadores de miles
        const formattedX = Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        const formattedY = Math.round(y).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

        mapCoordinates.value = `X: ${formattedX}, Y: ${formattedY}`
      } catch (error) {
        console.error('Error al convertir coordenadas:', error)
        mapCoordinates.value = 'Error en coordenadas'
      }
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
