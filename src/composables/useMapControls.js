/**
 * Composable para manejar las acciones de control del mapa
 * Siguiendo principios de Clean Code Architecture
 */
export function useMapControls(mapService) {
  /**
   * Aumenta el nivel de zoom del mapa
   */
  const zoomIn = () => {
    if (mapService && mapService.zoomIn) {
      mapService.zoomIn()
    }
  }

  /**
   * Disminuye el nivel de zoom del mapa
   */
  const zoomOut = () => {
    if (mapService && mapService.zoomOut) {
      mapService.zoomOut()
    }
  }

  /**
   * Regresa a la vista inicial del mapa
   */
  const zoomToHome = () => {
    if (mapService && mapService.zoomToHome) {
      mapService.zoomToHome()
    }
  }

  /**
   * Alterna el modo de pantalla completa
   */
  const toggleFullscreen = () => {
    if (mapService && mapService.toggleFullscreen) {
      mapService.toggleFullscreen()
    }
  }

  /**
   * Centra el mapa en coordenadas específicas
   * @param {Array} coordinates - [lat, lng]
   * @param {number} zoom - Nivel de zoom opcional
   */
  const centerMap = (coordinates, zoom = null) => {
    if (mapService && mapService.map) {
      if (zoom !== null) {
        mapService.map.setView(coordinates, zoom)
      } else {
        mapService.map.panTo(coordinates)
      }
    }
  }

  /**
   * Ajusta la vista del mapa a los límites especificados
   * @param {Object} bounds - Límites del mapa
   */
  const fitBounds = (bounds) => {
    if (mapService && mapService.map && bounds) {
      mapService.map.fitBounds(bounds)
    }
  }

  return {
    // Métodos de control básicos
    zoomIn,
    zoomOut,
    zoomToHome,
    toggleFullscreen,

    // Métodos de navegación avanzados
    centerMap,
    fitBounds
  }
}
