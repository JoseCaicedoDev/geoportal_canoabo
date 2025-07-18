import {
  GEOSERVER_WFS_SUELO_URL,
  GEOSERVER_WFS_RIOS_URL,
  GEOSERVER_WFS_PERIMETRO_URL,
  GEOSERVER_WFS_EMBALSE_URL
} from '../urls.js'

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

const layerDisplayNames = {
  'rios-wfs': 'Ríos',
  'embalse-wfs': 'Embalse',
  'suelos-wfs': 'Suelo',
  'perimetro-wfs': 'Perímetro'
}

const layerConfigs = {
  'suelos-wfs': {
    type: 'wfs',
    geometryType: 'Point',
    url: GEOSERVER_WFS_SUELO_URL,
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
    type: 'wfs',
    geometryType: 'LineString',
    url: GEOSERVER_WFS_RIOS_URL,
    style: {
      color: '#0538ff',
      weight: 3,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round'
    }
  },
  'embalse-wfs': {
    type: 'wfs',
    geometryType: 'Polygon',
    url: GEOSERVER_WFS_EMBALSE_URL,
    style: {
      color: '#0538ff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.6,
      fillColor: '#3b82f6'
    }
  },
  'perimetro-wfs': {
    type: 'wfs',
    geometryType: 'Polygon',
    url: GEOSERVER_WFS_PERIMETRO_URL,
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
    if (!config || config.type !== 'wfs') return []

    try {
      const response = await fetch(config.url)
      if (!response.ok) {
        console.error('Error fetching WFS data:', response.status)
        return []
      }

      const geojson = await response.json()

      // Convertir GeoJSON features a formato de tabla
      return geojson.features.map((feature, index) => {
        const props = feature.properties
        return {
          id: props.id || props.gml_id || `feature_${index}`,
          nombre: props.nombre || props.h1_text || props.name || props.Name || 'Sin nombre',
          tipo: props.tipo || props.type || props.Type || 'N/A',
          area: props.area || props.Area || 'N/A',
          ph: props.ph || props.pH || 'N/A',
          clasificacion: props.clasificacion || props.h1_text || 'N/A',
          fuente: 'WFS GeoServer',
          ...props // Incluir todas las propiedades originales
        }
      })
    } catch (error) {
      console.error('Error getting WFS data:', error)
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
  }
}

