// Configuración de capas
const layerGroups = {
  'hydrology': {
    name: 'Hidrología',
    color: 'blue-500',
    layers: ['rio-canoabo', 'afluentes', 'cuenca']
  },
  'geology': {
    name: 'Geología',
    color: 'amber-500',
    layers: ['formaciones', 'suelos']
  },
  'settlements': {
    name: 'Asentamientos',
    color: 'red-500',
    layers: ['centros-poblados', 'vias']
  }
}

const layerDisplayNames = {
  'rio-canoabo': 'Río Canoabo',
  'afluentes': 'Afluentes',
  'cuenca': 'Cuenca',
  'formaciones': 'Formaciones Rocosas',
  'suelos': 'Tipos de Suelo',
  'centros-poblados': 'Centros Poblados',
  'vias': 'Vías'
}

const layerStyles = {
  light: {
    'rio-canoabo': { color: 'blue-500' },
    'afluentes': { color: 'blue-400' },
    'cuenca': { color: 'blue-300' },
    'formaciones': { color: 'yellow-700' },
    'suelos': { color: 'amber-500' },
    'centros-poblados': { color: 'red-500' },
    'vias': { color: 'gray-600' }
  },
  dark: {
    'rio-canoabo': { color: 'blue-400' },
    'afluentes': { color: 'blue-300' },
    'cuenca': { color: 'blue-200' },
    'formaciones': { color: 'yellow-600' },
    'suelos': { color: 'amber-400' },
    'centros-poblados': { color: 'red-400' },
    'vias': { color: 'gray-400' }
  }
}

const layerSampleData = {
  'rio-canoabo': [
    { id: 'RC001', nombre: 'Río Canoabo Principal', tipo: 'Río principal', area: '125.5' },
    { id: 'RC002', nombre: 'Río Canoabo Medio', tipo: 'Río principal', area: '89.2' },
    { id: 'RC003', nombre: 'Río Canoabo Bajo', tipo: 'Río principal', area: '67.8' }
  ],
  'suelos': [
    { id: 'pg_Suelo8_ur1', nombre: 'Valle Hondo', tipo: 'Suelo agrícola', area: '15.2' },
    { id: 'pg_Suelo8_ur2', nombre: 'La Mejiena', tipo: 'Suelo forestal', area: '23.1' },
    { id: 'pg_Suelo8_ur4', nombre: 'El Cafe', tipo: 'Suelo agrícola', area: '8.9' },
    { id: 'pg_Suelo8_ur5', nombre: 'Guineo C', tipo: 'Suelo mixto', area: '18.7' },
    { id: 'pg_Suelo8_ur6', nombre: 'Guineo Arriba', tipo: 'Suelo forestal', area: '12.4' },
    { id: 'pg_Suelo8_ur7', nombre: 'Casa de Mandarina', tipo: 'Suelo agrícola', area: '9.6' },
    { id: 'pg_Suelo8_ur8', nombre: 'Santa Rosa', tipo: 'Suelo urbano', area: '5.3' }
  ],
  'centros-poblados': [
    { id: 'CP001', nombre: 'Canoabo Centro', tipo: 'Centro urbano', area: '2.1' },
    { id: 'CP002', nombre: 'Las Flores', tipo: 'Caserío', area: '0.8' },
    { id: 'CP003', nombre: 'El Palmar', tipo: 'Sector rural', area: '1.2' }
  ]
}

export const layerService = {
  getLayerGroups() {
    return layerGroups
  },

  getLayerDisplayName(layerId) {
    return layerDisplayNames[layerId] || layerId
  },

  getLayerStyle(layerId, isDark = false) {
    const theme = isDark ? layerStyles.dark : layerStyles.light
    return theme[layerId] || { color: isDark ? 'gray-400' : 'gray-500' }
  },

  getLayerData(layerId) {
    return layerSampleData[layerId] || []
  },

  async exportLayer(layerId, format = 'geojson') {
    const layerName = this.getLayerDisplayName(layerId)
    console.log(`Exportando capa ${layerName} en formato ${format}`)

    // Aquí iría la lógica real de exportación
    const data = this.getLayerData(layerId)
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

    return {
      fileName: `${layerId}_export.${format}`,
      blob
    }
  },

  async changeLayerStyle(layerId, style) {
    if (!layerStyles[layerId]) {
      throw new Error(`Capa no encontrada: ${layerId}`)
    }

    // Aquí iría la lógica real de cambio de estilo
    layerStyles[layerId] = { ...layerStyles[layerId], ...style }
    console.log('Estilo actualizado:', layerStyles[layerId])

    return layerStyles[layerId]
  },

  async showLayerProperties(layerId) {
    const data = this.getLayerData(layerId)
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

  filterLayerData(layerId, query) {
    const data = this.getLayerData(layerId)
    if (!query) return data

    const lowercaseQuery = query.toLowerCase()
    return data.filter(item =>
      item.id.toLowerCase().includes(lowercaseQuery) ||
      item.nombre.toLowerCase().includes(lowercaseQuery) ||
      item.tipo.toLowerCase().includes(lowercaseQuery)
    )
  },

  sortLayerData(data, field, direction = 'asc') {
    return [...data].sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  },

  async zoomToFeature(layerId, featureId) {
    const data = this.getLayerData(layerId)
    const feature = data.find(f => f.id === featureId)

    if (!feature) {
      throw new Error(`Feature no encontrado: ${featureId}`)
    }

    // Aquí iría la lógica real de zoom
    console.log(`Zoom a feature ${featureId} en capa ${layerId}`)
    return feature
  }
}

