/**
 * Composable para configuración centralizada del mapa
 * Siguiendo principios de Clean Code Architecture
 */
export function useMapConfig() {
  // Configuración por defecto para la región de Canoabo
  const DEFAULT_CONFIG = {
    center: [10.3316, -68.2833], // Coordenadas de Canoabo, Carabobo, Venezuela
    zoom: 12,
    minZoom: 8,
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
    preferCanvas: false
  }

  // Configuración de capas base disponibles
  const BASE_LAYERS_CONFIG = {
    'world-imagery': {
      name: 'Imágenes Satelitales',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    'openstreetmap': {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    'cartodb-positron': {
      name: 'CartoDB Positron',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© CARTO'
    }
  }

  // Configuración de controles del mapa
  const CONTROLS_CONFIG = {
    zoom: {
      position: 'topright',
      zoomInTitle: 'Acercar',
      zoomOutTitle: 'Alejar'
    },
    scale: {
      position: 'bottomleft',
      metric: true,
      imperial: false
    },
    attribution: {
      position: 'bottomright',
      prefix: false
    }
  }

  // Configuración de límites geográficos para la región
  const BOUNDS_CONFIG = {
    // Límites aproximados de la región de Canoabo
    southwest: [10.2, -68.4],
    northeast: [10.5, -68.1],
    maxBoundsViscosity: 0.8
  }

  /**
   * Obtiene la configuración completa del mapa
   * @param {Object} customConfig - Configuración personalizada opcional
   * @returns {Object} Configuración completa del mapa
   */
  const getMapConfig = (customConfig = {}) => {
    return {
      ...DEFAULT_CONFIG,
      ...customConfig,
      maxBounds: [
        BOUNDS_CONFIG.southwest,
        BOUNDS_CONFIG.northeast
      ]
    }
  }

  /**
   * Obtiene la configuración de una capa base específica
   * @param {string} layerId - ID de la capa base
   * @returns {Object|null} Configuración de la capa base
   */
  const getBaseLayerConfig = (layerId) => {
    return BASE_LAYERS_CONFIG[layerId] || null
  }

  /**
   * Obtiene todas las capas base disponibles
   * @returns {Object} Objeto con todas las configuraciones de capas base
   */
  const getAllBaseLayersConfig = () => {
    return BASE_LAYERS_CONFIG
  }

  /**
   * Obtiene la configuración de controles
   * @returns {Object} Configuración de controles del mapa
   */
  const getControlsConfig = () => {
    return CONTROLS_CONFIG
  }

  /**
   * Verifica si una coordenada está dentro de los límites de la región
   * @param {Array} latlng - [latitud, longitud]
   * @returns {boolean} True si está dentro de los límites
   */
  const isWithinBounds = (latlng) => {
    const [lat, lng] = latlng
    const { southwest, northeast } = BOUNDS_CONFIG

    return lat >= southwest[0] && lat <= northeast[0] &&
      lng >= southwest[1] && lng <= northeast[1]
  }

  /**
   * Obtiene el centro de la región
   * @returns {Array} [latitud, longitud] del centro
   */
  const getRegionCenter = () => {
    return DEFAULT_CONFIG.center
  }

  return {
    // Configuraciones
    DEFAULT_CONFIG,
    BASE_LAYERS_CONFIG,
    CONTROLS_CONFIG,
    BOUNDS_CONFIG,

    // Métodos
    getMapConfig,
    getBaseLayerConfig,
    getAllBaseLayersConfig,
    getControlsConfig,
    isWithinBounds,
    getRegionCenter
  }
}
