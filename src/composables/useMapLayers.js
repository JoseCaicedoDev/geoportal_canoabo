import { watch } from 'vue'
import L from 'leaflet'

/**
 * Composable para manejar las capas WFS del mapa
 * Separación de responsabilidades para lógica de capas
 */
export function useMapLayers(mapService, layerService, store) {

  /**
   * Configuración de popups estándar para capas WFS
   * @param {Object} feature - Feature de GeoJSON
   * @param {Object} layer - Capa de Leaflet
   * @param {string} layerId - ID de la capa
   * @param {Object} layerDisplayNames - Nombres de display de capas
   */
  const setupFeaturePopup = (feature, layer, layerId, layerDisplayNames) => {
    const props = feature.properties || {}

    // Configurar popup según el tipo de capa
    const popupConfig = getPopupConfig(layerId, props, layerDisplayNames)

    layer.on('click', () => {
      layer.bindPopup(popupConfig.content).openPopup()
      store.currentLayerId = layerId
      store.attributePanelVisible = true
    })

    // Efectos hover
    layer.on('mouseover', (e) => {
      applyHoverStyle(e.target, layerId)
    })

    layer.on('mouseout', (e) => {
      removeHoverStyle(e.target, layerId)
    })
  }

  /**
   * Obtiene la configuración del popup según el tipo de capa
   */
  const getPopupConfig = (layerId, props, layerDisplayNames) => {
    const layerName = layerDisplayNames[layerId] || layerId
    const baseContent = `<div style="min-width:180px; font-family:sans-serif;">
      <div style="font-size:1.1em;font-weight:bold;color:${getLayerColor(layerId)};margin-bottom:4px;">
        ${props.nombre || props.name || props.Name || layerName}
      </div>`

    const configs = {
      'rios-wfs': {
        content: baseContent + `
          <div><b>Tipo:</b> ${props.tipo || 'Curso de agua'}</div>
          <div><b>Geometría:</b> ${props.geometry?.type || 'LineString'}</div>
          <div><b>Longitud:</b> ${props.longitud || props.length || '-'}</div>
          <div><b>Cuenca:</b> ${props.cuenca || 'Canoabo'}</div>
          <div><b>ID:</b> ${props.id || props.gml_id || '-'}</div>
        </div>`
      },
      'perimetro-wfs': {
        content: baseContent + `
          <div><b>Tipo:</b> Perímetro</div>
          <div><b>Geometría:</b> ${props.geometry?.type || 'Polygon'}</div>
          <div><b>Área:</b> ${props.area || props.Area || 'N/A'}</div>
          <div><b>Descripción:</b> ${props.descripcion || 'Límite territorial'}</div>
          <div><b>ID:</b> ${props.id || props.gml_id || '-'}</div>
        </div>`
      },
      'embalse-wfs': {
        content: baseContent + `
          <div><b>Tipo:</b> ${props.tipo || 'Cuerpo de agua'}</div>
          <div><b>Geometría:</b> ${props.geometry?.type || '-'}</div>
          <div><b>Capacidad:</b> ${props.capacidad || props.volumen || 'N/A'}</div>
          <div><b>Estado:</b> ${props.estado || 'Activo'}</div>
          <div><b>Cuenca:</b> ${props.cuenca || 'Canoabo'}</div>
          <div><b>ID:</b> ${props.id || props.gml_id || '-'}</div>
        </div>`
      },
      'suelos-wfs': {
        content: baseContent + `
          <div><b>Tipo:</b> ${props.tipo || 'Suelo'}</div>
          <div><b>Textura:</b> ${props.h1_text || props.textura || 'N/A'}</div>
          <div><b>pH:</b> ${props.ph || props.pH || 'N/A'}</div>
          <div><b>Clasificación:</b> ${props.clasificacion || 'N/A'}</div>
          <div><b>ID:</b> ${props.id || props.gml_id || '-'}</div>
        </div>`
      }
    }

    return configs[layerId] || { content: baseContent + '</div>' }
  }

  /**
   * Obtiene el color de la capa según su tipo
   */
  const getLayerColor = (layerId) => {
    const colors = {
      'rios-wfs': '#1d4ed8',
      'perimetro-wfs': '#dc2626',
      'embalse-wfs': '#0284c7',
      'suelos-wfs': '#d97706'
    }
    return colors[layerId] || '#6b7280'
  }

  /**
   * Aplica estilos de hover según el tipo de capa
   */
  const applyHoverStyle = (target, layerId) => {
    if (!target.setStyle && !target.setRadius) return

    const hoverStyles = {
      'rios-wfs': { weight: 5, opacity: 1 },
      'perimetro-wfs': { weight: 4, fillOpacity: 0.2 },
      'embalse-wfs': { weight: 4, fillOpacity: 0.8 }
    }

    const style = hoverStyles[layerId]
    if (style && target.setStyle) {
      target.setStyle(style)
    } else if (target.setRadius) {
      target.setRadius(10) // Para CircleMarkers
    }
  }

  /**
   * Remueve estilos de hover
   */
  const removeHoverStyle = (target, layerId) => {
    if (!target.setStyle && !target.setRadius) return

    const normalStyles = {
      'rios-wfs': { weight: 3, opacity: 1 },
      'perimetro-wfs': { weight: 2, fillOpacity: 0.1 },
      'embalse-wfs': { weight: 2, fillOpacity: 0.6 }
    }

    const style = normalStyles[layerId]
    if (style && target.setStyle) {
      target.setStyle(style)
    } else if (target.setRadius) {
      target.setRadius(8) // Para CircleMarkers
    }
  }

  /**
   * Configura watcher para cambios en las capas seleccionadas
   */
  const setupLayerWatcher = () => {
    return watch(() => store.selectedLayers, (newLayers, oldLayers) => {
      if (!mapService.map) return

      // Detectar cambios
      const added = [...newLayers].filter(layer => !oldLayers || !oldLayers.has(layer))
      const removed = oldLayers ? [...oldLayers].filter(layer => !newLayers.has(layer)) : []

      // Procesar capas agregadas
      added.forEach(layerId => {
        if (isWFSLayer(layerId)) {
          mapService.addLayer(layerId)
        }
      })

      // Procesar capas removidas
      removed.forEach(layerId => {
        if (isWFSLayer(layerId)) {
          mapService.removeLayer(layerId)
        }
      })
    }, { deep: true })
  }

  /**
   * Verifica si una capa es del tipo WFS
   */
  const isWFSLayer = (layerId) => {
    return ['suelos-wfs', 'rios-wfs', 'perimetro-wfs', 'embalse-wfs'].includes(layerId)
  }

  return {
    setupFeaturePopup,
    setupLayerWatcher,
    isWFSLayer,
    getLayerColor
  }
}
