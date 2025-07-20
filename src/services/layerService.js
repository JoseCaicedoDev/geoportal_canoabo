import {
  GEOSERVER_WFS_SUELO_URL,
  GEOSERVER_WFS_RIOS_URL,
  GEOSERVER_WFS_PERIMETRO_URL,
  GEOSERVER_WFS_EMBALSE_URL
} from '../urls.js'
import proj4 from 'proj4'
import { reproject } from 'reproject'

// Función para obtener la URL correcta basada en el entorno
function getAssetUrl(path) {
  const base = import.meta.env.BASE_URL || '/'
  // Asegurar que la ruta comience con ./
  const cleanPath = path.startsWith('./') ? path.slice(2) : path.replace(/^\//, '')
  return base + cleanPath
}

// Configuración de capas
const layerGroups = {
  'hydrology': {
    name: 'Hidrología',
    color: 'blue-500',
    layers: ['rios-wfs', 'embalse-wfs']
  },
  'geology': {
    name: 'Geología',
    color: 'amber-500',
    layers: ['suelos-wfs']
  },
  'boundaries': {
    name: 'Límites',
    color: 'red-600',
    layers: ['perimetro-wfs']
  }
}

// URLs de archivos locales como fallback
const localFiles = {
  'suelos-wfs': './data/pg_Suelo8_ur.geojson',
  'rios-wfs': './data/rios_ur.geojson',
  'embalse-wfs': './data/pg_emblase_ur.geojson',
  'perimetro-wfs': './data/pg_perimetro.geojson'
}

/**
 * Reproyecta un objeto GeoJSON del sistema de coordenadas origen al sistema de coordenadas destino
 * @param {Object} geoJSON - Objeto GeoJSON a reproyectar
 * @param {string} fromCRS - Sistema de coordenadas de origen (ej. "EPSG:2202")
 * @param {string} toCRS - Sistema de coordenadas de destino (ej. "EPSG:4326")
 * @returns {Object} - Objeto GeoJSON reproyectado
 */
function reprojectGeoJSON(geoJSON, fromCRS, toCRS = "EPSG:4326") {
  if (!geoJSON) return null;

  try {
    // Definir el sistema de coordenadas EPSG:2202 (REGVEN UTM Zona 19)
    if (fromCRS === "EPSG:2202") {
      proj4.defs("EPSG:2202", "+proj=utm +zone=19 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    }

    // Realizar la reproyección
    return reproject(geoJSON, fromCRS, toCRS);
  } catch (error) {
    console.error('Error al reproyectar GeoJSON:', error);
    return geoJSON;  // Devolver el GeoJSON original en caso de error
  }
}

/**
 * Obtiene datos GeoJSON desde una URL o archivo local y los reproyecta si es necesario
 * @param {string} url - URL o ruta al archivo GeoJSON
 * @returns {Promise<Object|null>} - Objeto GeoJSON o null si hay error
 */
async function getGeoJSONData(url) {
  try {
    // Construir la URL correcta usando la función utilitaria
    const fullUrl = getAssetUrl(url);
    console.log('Loading GeoJSON from:', fullUrl);
    
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`Error al cargar los datos: ${response.status}`);
    }

    const geoJSONData = await response.json();

    // Los archivos GeoJSON locales ya están en WGS84 (EPSG:4326), no necesitan reproyección
    console.log('GeoJSON loaded successfully, already in WGS84 format');
    return geoJSONData;

  } catch (error) {
    console.error('Error obteniendo datos GeoJSON:', error);
    console.error('Error loading local GeoJSON file:', url);
    return null;
  }
}

const layerDisplayNames = {
  'rios-wfs': 'Ríos',
  'embalse-wfs': 'Embalse',
  'suelos-wfs': 'Suelo',
  'perimetro-wfs': 'Perímetro'
}

const layerConfigs = {
  'suelos-wfs': {
    type: 'local',
    geometryType: 'Point',
    url: localFiles['suelos-wfs'],
    style: {
      color: '#d97706',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.4,
      fillColor: '#f59e0b'
    },
    texturaColors: {
      a: '#2d2139',      // Arenoso
      aF: '#7fa7c5',     // Areno Franco
      F: '#3ecfc6',      // Franco
      Fa: '#8eea70',     // Franco Arenoso
      FA: '#c2e96a',     // Franco Arcilloso
      FL: '#e3a23c',     // Franco Limoso
      L: '#a34b0e',      // Limoso
      A: '#e78a9b'       // Arcilloso
    }
  },
  'rios-wfs': {
    type: 'local',
    geometryType: 'LineString',
    url: localFiles['rios-wfs'],
    style: {
      color: '#0538ff',
      weight: 3,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round'
    }
  },
  'embalse-wfs': {
    type: 'local',
    geometryType: 'Polygon',
    url: localFiles['embalse-wfs'],
    style: {
      color: '#0538ff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.6,
      fillColor: '#3b82f6'
    }
  },
  'perimetro-wfs': {
    type: 'local',
    geometryType: 'Polygon',
    url: localFiles['perimetro-wfs'],
    style: {
      color: '#dc2626',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.1,
      fillColor: 'transparent'
    }
  }
}

const layerStyles = {
  light: {
    'rios-wfs': { color: 'blue-600' },
    'embalse-wfs': { color: 'sky-500' },
    'suelos-wfs': { color: 'amber-500' },
    'perimetro-wfs': { color: 'red-600' }
  },
  dark: {
    'rios-wfs': { color: 'blue-400' },
    'embalse-wfs': { color: 'sky-400' },
    'suelos-wfs': { color: 'amber-400' },
    'perimetro-wfs': { color: 'red-500' }
  }
}

export const layerService = {
  getLayerGroups() {
    return layerGroups
  },

  getLayerDisplayNames() {
    return layerDisplayNames
  },

  getLayerDisplayName(layerId) {
    return layerDisplayNames[layerId] || layerId
  },

  getLayerConfig(layerId) {
    return layerConfigs[layerId] || null
  },

  getLayerGeometryType(layerId) {
    const config = layerConfigs[layerId]
    return config ? config.geometryType : 'Unknown'
  },

  getTexturaColor(layerId, textura) {
    const config = layerConfigs[layerId]
    if (config && config.texturaColors && textura) {
      return config.texturaColors[textura] || '#888888'
    }
    return '#888888'
  },

  getLayerStyle(layerId, isDark = false) {
    const theme = isDark ? layerStyles.dark : layerStyles.light
    return theme[layerId] || { color: isDark ? 'gray-400' : 'gray-500' }
  },

  async getWFSData(layerId) {
    const config = this.getLayerConfig(layerId)
    if (!config || (config.type !== 'wfs' && config.type !== 'local')) return []

    try {
      let geojson;
      
      if (config.type === 'local') {
        // Para archivos locales, usar la función getGeoJSONData
        geojson = await getGeoJSONData(config.url)
        if (!geojson) {
          console.error('Error loading local GeoJSON file:', config.url)
          return []
        }
      } else {
        // Para capas WFS remotas (fallback)
        const response = await fetch(config.url)
        if (!response.ok) {
          console.error('Error fetching WFS data:', response.status)
          return []
        }
        geojson = await response.json()
      }

      // Convertir GeoJSON features a formato de tabla
      const processedFeatures = geojson.features.map((feature, index) => {
        const props = feature.properties

        // Extract ID from multiple possible sources
        const featureId = props.id || props.gml_id || props.fid || props.gid || props.objectid || `feature_${index}`

        const processedFeature = {
          // Primary ID for selection (only add if not already exists)
          id: featureId,

          // Include geometry for selection
          geometry: feature.geometry,

          // Include ONLY original properties from the JSON
          ...props
        }

        // Only add alternative ID fields if they don't already exist and are different from primary ID
        if (props.fid && props.fid !== featureId) {
          processedFeature.fid = props.fid
        }
        if (props.gml_id && props.gml_id !== featureId) {
          processedFeature.gml_id = props.gml_id
        }
        if (props.gid && props.gid !== featureId) {
          processedFeature.gid = props.gid
        }
        if (props.objectid && props.objectid !== featureId) {
          processedFeature.objectid = props.objectid
        }

        return processedFeature
      })

      return processedFeatures
    } catch (error) {
      console.error('Error getting layer data:', error)
      return []
    }
  },

  async getLayerData(layerId) {
    // Para capas WFS, obtener datos dinámicamente
    if (layerId.endsWith('-wfs')) {
      return await this.getWFSData(layerId)
    }
    return []
  },

  async getLayerFields(layerId) {
    // Para capas WFS, generar campos dinámicamente basados en los datos
    if (layerId.endsWith('-wfs')) {
      const data = await this.getLayerData(layerId)
      if (data.length === 0) return []

      // Generar campos automáticamente desde el primer registro
      return Object.keys(data[0]).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        sortable: true,
        type: typeof data[0][key] === 'number' ? 'number' : 'string'
      }))
    }
    return []
  },

  async exportLayer(layerId, format = 'geojson') {
    const layerName = this.getLayerDisplayName(layerId)
    const data = await this.getLayerData(layerId)

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

    return {
      fileName: `${layerId}_export.${format}`,
      blob
    }
  },

  async showLayerProperties(layerId) {
    const data = await this.getLayerData(layerId)
    const style = this.getLayerStyle(layerId)

    return {
      id: layerId,
      name: this.getLayerDisplayName(layerId),
      features: data.length,
      style,
      metadata: {
        source: 'GeoServer WFS',
        lastUpdate: new Date().toISOString(),
        description: `Capa de ${this.getLayerDisplayName(layerId)} para la región de Canoabo`
      }
    }
  },

  filterLayerData(data, query) {
    if (!query) return data

    const lowercaseQuery = query.toLowerCase()
    return data.filter(item =>
      (item.id && item.id.toLowerCase().includes(lowercaseQuery)) ||
      (item.nombre && item.nombre.toLowerCase().includes(lowercaseQuery)) ||
      (item.tipo && item.tipo.toLowerCase().includes(lowercaseQuery)) ||
      (item.h1_text && item.h1_text.toLowerCase().includes(lowercaseQuery)) ||
      (item.clasificacion && item.clasificacion.toLowerCase().includes(lowercaseQuery))
    )
  },

  sortLayerData(data, field, direction = 'asc') {
    return [...data].sort((a, b) => {
      let aVal = a[field]
      let bVal = b[field]

      // Convertir a números si es posible
      if (!isNaN(aVal) && !isNaN(bVal)) {
        aVal = parseFloat(aVal)
        bVal = parseFloat(bVal)
      } else {
        // Comparación de strings (case insensitive)
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })
  },

  // Feature selection and map interaction
  async zoomToFeature(layerId, featureId) {
    try {
      // Import mapService here to avoid circular dependency
      const { mapService } = await import('./mapService.js')

      // Get feature data to find coordinates if needed
      const layerData = await this.getLayerData(layerId)
      const feature = layerData.find(item => {
        // Try multiple ID fields for matching
        const possibleIds = [
          item.id,
          item.fid,
          item.gml_id,
          item.gid,
          item.objectid
        ]

        // Convert featureId to string for comparison
        const searchId = String(featureId)

        return possibleIds.some(id => id && String(id) === searchId)
      })

      let coordinates = null
      if (feature && feature.geometry) {
        // Extract coordinates from geometry
        if (feature.geometry.type === 'Point') {
          // Coordenadas en formato [longitude, latitude] - ya están en WGS84
          const [lng, lat] = feature.geometry.coordinates
          coordinates = {
            lat: lat,
            lng: lng
          }
          console.log('Feature coordinates extracted:', coordinates, 'for feature ID:', featureId)
        }
      } else {
        console.warn('Feature not found or missing geometry for ID:', featureId)
      }
      
      // Select and zoom to feature on map
      return mapService.selectFeature(layerId, featureId, coordinates)
    } catch (error) {
      console.error('Error zooming to feature:', error)
      return false
    }
  },

  async selectFeatureOnMap(layerId, featureId) {
    return this.zoomToFeature(layerId, featureId)
  },

  // Extraer el nombre técnico de la capa desde la URL WFS
  getLayerTechnicalName(layerId) {
    const config = this.getLayerConfig(layerId)
    if (!config || !config.url) {
      return null
    }

    try {
      // Buscar el parámetro typeName en la URL
      const url = new URL(config.url, window.location.origin)
      const typeName = url.searchParams.get('typeName')

      if (typeName) {
        // Extraer la parte después de los dos puntos (ej: "canoabo:pg_rios_ur" -> "pg_rios_ur")
        const parts = typeName.split(':')
        return parts.length > 1 ? parts[1] : typeName
      }
    } catch (error) {
      console.error('Error parsing layer URL:', error)
    }

    return null
  },

  // Extraer el nombre del archivo GeoJSON desde la URL
  getGeoJSONFileName(layerId) {
    const config = this.getLayerConfig(layerId)
    if (!config || !config.url) {
      return null
    }

    try {
      // Extraer el nombre del archivo desde la URL
      const urlPath = config.url
      const fileName = urlPath.split('/').pop() // Obtiene la última parte de la ruta
      return fileName || null
    } catch (error) {
      console.error('Error extracting GeoJSON file name:', error)
      return null
    }
  },

  // Obtener información detallada de la capa para el modal
  async getLayerDetails(layerId) {
    try {
      const config = this.getLayerConfig(layerId)
      const displayName = this.getLayerDisplayName(layerId)
      const geoJsonFileName = this.getGeoJSONFileName(layerId)

      if (!config) {
        return {
          name: geoJsonFileName || displayName,
          displayName: displayName,
          geometryType: 'Unknown',
          recordCount: 0,
          serviceType: 'Unknown',
          variables: [],
          referenceSystem: 'EPSG:4326'
        }
      }

      // Obtener datos de la capa para calcular el número de registros y variables
      let data = []
      let variables = []

      if (config.type === 'wfs' || config.type === 'local') {
        data = await this.getWFSData(layerId)

        // Extraer variables (campos) de los datos
        if (data.length > 0) {
          variables = Object.keys(data[0]).filter(key =>
            !['id', 'geometry', 'fid', 'gml_id', 'gid', 'objectid'].includes(key)
          )
        }
      }

      return {
        name: geoJsonFileName || displayName, // Nombre del archivo GeoJSON para el campo "Layer name"
        displayName: displayName, // Nombre amigable para el título del modal
        geometryType: config.geometryType || 'Unknown',
        recordCount: data.length,
        serviceType: config.type.toUpperCase(),
        variables: variables,
        referenceSystem: 'EPSG:4326', // Todas las capas usan este sistema de referencia
        url: config.url
      }
    } catch (error) {
      console.error('Error getting layer details:', error)
      const displayName = this.getLayerDisplayName(layerId)
      const geoJsonFileName = this.getGeoJSONFileName(layerId)

      return {
        name: geoJsonFileName || displayName,
        displayName: displayName,
        geometryType: 'Unknown',
        recordCount: 0,
        serviceType: 'Error',
        variables: [],
        referenceSystem: 'EPSG:4326'
      }
    }
  }
}

