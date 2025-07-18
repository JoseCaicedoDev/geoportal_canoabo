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
    { id: 'RC001', nombre: 'Río Canoabo Principal', tipo: 'Río principal', area: '125.5', longitud: '45.2', estado: 'Activo' },
    { id: 'RC002', nombre: 'Río Canoabo Medio', tipo: 'Río principal', area: '89.2', longitud: '32.8', estado: 'Activo' },
    { id: 'RC003', nombre: 'Río Canoabo Bajo', tipo: 'Río principal', area: '67.8', longitud: '28.5', estado: 'Activo' }
  ],
  'afluentes': [
    { id: 'AF001', nombre: 'Afluente Norte', tipo: 'Afluente', area: '12.5', longitud: '8.2', estado: 'Activo' },
    { id: 'AF002', nombre: 'Afluente Sur', tipo: 'Afluente', area: '9.8', longitud: '6.5', estado: 'Activo' },
    { id: 'AF003', nombre: 'Quebrada El Cedro', tipo: 'Quebrada', area: '5.2', longitud: '4.1', estado: 'Estacional' }
  ],
  'cuenca': [
    { id: 'CU001', nombre: 'Cuenca Alta Canoabo', tipo: 'Cuenca', area: '256.8', perimetro: '78.5', elevacion: '1200' },
    { id: 'CU002', nombre: 'Cuenca Media Canoabo', tipo: 'Cuenca', area: '189.2', perimetro: '62.3', elevacion: '800' },
    { id: 'CU003', nombre: 'Cuenca Baja Canoabo', tipo: 'Cuenca', area: '134.5', perimetro: '45.8', elevacion: '400' }
  ],
  'suelos': [
    { id: 'pg_Suelo8_ur1', nombre: 'Valle Hondo', tipo: 'Suelo agrícola', area: '15.2', ph: '6.8', clasificacion: 'Entisol' },
    { id: 'pg_Suelo8_ur2', nombre: 'La Mejiena', tipo: 'Suelo forestal', area: '23.1', ph: '5.9', clasificacion: 'Ultisol' },
    { id: 'pg_Suelo8_ur4', nombre: 'El Cafe', tipo: 'Suelo agrícola', area: '8.9', ph: '6.5', clasificacion: 'Inceptisol' },
    { id: 'pg_Suelo8_ur5', nombre: 'Guineo C', tipo: 'Suelo mixto', area: '18.7', ph: '6.2', clasificacion: 'Alfisol' },
    { id: 'pg_Suelo8_ur6', nombre: 'Guineo Arriba', tipo: 'Suelo forestal', area: '12.4', ph: '5.8', clasificacion: 'Ultisol' },
    { id: 'pg_Suelo8_ur7', nombre: 'Casa de Mandarina', tipo: 'Suelo agrícola', area: '9.6', ph: '6.9', clasificacion: 'Mollisol' },
    { id: 'pg_Suelo8_ur8', nombre: 'Santa Rosa', tipo: 'Suelo urbano', area: '5.3', ph: '7.1', clasificacion: 'Anthropic' }
  ],
  'formaciones': [
    { id: 'GE001', nombre: 'Formación Tinaquillo', tipo: 'Sedimentaria', area: '45.8', edad: 'Cretácico', composicion: 'Caliza' },
    { id: 'GE002', nombre: 'Formación Las Mercedes', tipo: 'Metamórfica', area: '38.2', edad: 'Precámbrico', composicion: 'Gneis' },
    { id: 'GE003', nombre: 'Formación Guatire', tipo: 'Ígnea', area: '22.5', edad: 'Jurásico', composicion: 'Granito' }
  ],
  'centros-poblados': [
    { id: 'CP001', nombre: 'Canoabo Centro', tipo: 'Centro urbano', area: '2.1', poblacion: '15240', fundacion: '1620' },
    { id: 'CP002', nombre: 'Las Flores', tipo: 'Caserío', area: '0.8', poblacion: '890', fundacion: '1850' },
    { id: 'CP003', nombre: 'El Palmar', tipo: 'Sector rural', area: '1.2', poblacion: '450', fundacion: '1780' },
    { id: 'CP004', nombre: 'Santa Rosa', tipo: 'Barrio', area: '0.6', poblacion: '1200', fundacion: '1920' },
    { id: 'CP005', nombre: 'Valle Hondo', tipo: 'Sector rural', area: '1.8', poblacion: '680', fundacion: '1890' }
  ],
  'vias': [
    { id: 'VIA001', nombre: 'Carretera Nacional', tipo: 'Autopista', longitud: '25.8', estado: 'Bueno', material: 'Asfalto' },
    { id: 'VIA002', nombre: 'Vía Local Norte', tipo: 'Carretera', longitud: '18.5', estado: 'Regular', material: 'Asfalto' },
    { id: 'VIA003', nombre: 'Camino Rural Sur', tipo: 'Camino rural', longitud: '12.3', estado: 'Malo', material: 'Tierra' },
    { id: 'VIA004', nombre: 'Calle Principal Canoabo', tipo: 'Calle urbana', longitud: '3.2', estado: 'Bueno', material: 'Concreto' }
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

  getLayerFields(layerId) {
    const data = this.getLayerData(layerId)
    if (data.length === 0) return []

    const fieldConfig = {
      'rio-canoabo': [
        { key: 'id', label: 'ID', sortable: true, type: 'string' },
        { key: 'nombre', label: 'Nombre', sortable: true, type: 'string' },
        { key: 'tipo', label: 'Tipo', sortable: true, type: 'string' },
        { key: 'area', label: 'Área (km²)', sortable: true, type: 'number' },
        { key: 'longitud', label: 'Longitud (km)', sortable: true, type: 'number' },
        { key: 'estado', label: 'Estado', sortable: true, type: 'string' }
      ],
      'afluentes': [
        { key: 'id', label: 'ID', sortable: true, type: 'string' },
        { key: 'nombre', label: 'Nombre', sortable: true, type: 'string' },
        { key: 'tipo', label: 'Tipo', sortable: true, type: 'string' },
        { key: 'area', label: 'Área (km²)', sortable: true, type: 'number' },
        { key: 'longitud', label: 'Longitud (km)', sortable: true, type: 'number' },
        { key: 'estado', label: 'Estado', sortable: true, type: 'string' }
      ],
      'cuenca': [
        { key: 'id', label: 'ID', sortable: true, type: 'string' },
        { key: 'nombre', label: 'Nombre', sortable: true, type: 'string' },
        { key: 'tipo', label: 'Tipo', sortable: true, type: 'string' },
        { key: 'area', label: 'Área (km²)', sortable: true, type: 'number' },
        { key: 'perimetro', label: 'Perímetro (km)', sortable: true, type: 'number' },
        { key: 'elevacion', label: 'Elevación (m)', sortable: true, type: 'number' }
      ],
      'suelos': [
        { key: 'id', label: 'ID', sortable: true, type: 'string' },
        { key: 'nombre', label: 'Nombre', sortable: true, type: 'string' },
        { key: 'tipo', label: 'Tipo', sortable: true, type: 'string' },
        { key: 'area', label: 'Área (km²)', sortable: true, type: 'number' },
        { key: 'ph', label: 'pH', sortable: true, type: 'number' },
        { key: 'clasificacion', label: 'Clasificación', sortable: true, type: 'string' }
      ],
      'formaciones': [
        { key: 'id', label: 'ID', sortable: true, type: 'string' },
        { key: 'nombre', label: 'Nombre', sortable: true, type: 'string' },
        { key: 'tipo', label: 'Tipo', sortable: true, type: 'string' },
        { key: 'area', label: 'Área (km²)', sortable: true, type: 'number' },
        { key: 'edad', label: 'Edad Geológica', sortable: true, type: 'string' },
        { key: 'composicion', label: 'Composición', sortable: true, type: 'string' }
      ],
      'centros-poblados': [
        { key: 'id', label: 'ID', sortable: true, type: 'string' },
        { key: 'nombre', label: 'Nombre', sortable: true, type: 'string' },
        { key: 'tipo', label: 'Tipo', sortable: true, type: 'string' },
        { key: 'area', label: 'Área (km²)', sortable: true, type: 'number' },
        { key: 'poblacion', label: 'Población', sortable: true, type: 'number' },
        { key: 'fundacion', label: 'Año Fundación', sortable: true, type: 'number' }
      ],
      'vias': [
        { key: 'id', label: 'ID', sortable: true, type: 'string' },
        { key: 'nombre', label: 'Nombre', sortable: true, type: 'string' },
        { key: 'tipo', label: 'Tipo', sortable: true, type: 'string' },
        { key: 'longitud', label: 'Longitud (km)', sortable: true, type: 'number' },
        { key: 'estado', label: 'Estado', sortable: true, type: 'string' },
        { key: 'material', label: 'Material', sortable: true, type: 'string' }
      ]
    }

    return fieldConfig[layerId] || Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      sortable: true,
      type: 'string'
    }))
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

