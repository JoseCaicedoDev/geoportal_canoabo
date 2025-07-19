import L from 'leaflet'
import {
  ESRI_WORLD_IMAGERY_URL,
  ESRI_WORLD_STREET_URL,
  ESRI_WORLD_TOPO_URL,
  ESRI_WORLD_GRAYSCALE_URL,
  OSM_TILE_URL,
  OPENTOPOMAP_URL,
  ESRI_IMAGERY_ATTRIBUTION,
  ESRI_STREET_ATTRIBUTION,
  ESRI_TOPO_ATTRIBUTION,
  ESRI_GRAYSCALE_ATTRIBUTION,
  OSM_ATTRIBUTION,
  OPENTOPOMAP_ATTRIBUTION
} from '../urls.js'

class MapService {
  constructor() {
    this.map = null
    this.layers = new Map()
    this.baseLayer = null
    this.currentBaseLayerId = 'world-imagery' // Track current base layer
    this.initialCenter = [10.1833, -68.2833] // Default Canoabo coordinates
    this.initialZoom = 12 // Default zoom
  }

  initializeMap(containerId, options = {}) {
    const defaultOptions = {
      center: [10.1833, -68.2833], // Coordenadas de Canoabo
      zoom: 12,
      zoomControl: false // Desactivamos los controles por defecto
    }

    const finalOptions = { ...defaultOptions, ...options }

    // Store initial values for zoomToHome
    this.initialCenter = finalOptions.center
    this.initialZoom = finalOptions.zoom

    this.map = L.map(containerId, finalOptions)

    // Añadir capas base
    this.initializeBaseLayers()

    return this.map
  }

  initializeBaseLayers() {
    const baseLayers = {
      'world-imagery': L.tileLayer(ESRI_WORLD_IMAGERY_URL, {
        attribution: ESRI_IMAGERY_ATTRIBUTION,
        maxZoom: 19
      }),
      'world-street': L.tileLayer(ESRI_WORLD_STREET_URL, {
        attribution: ESRI_STREET_ATTRIBUTION,
        maxZoom: 19
      }),
      'world-topo': L.tileLayer(ESRI_WORLD_TOPO_URL, {
        attribution: ESRI_TOPO_ATTRIBUTION,
        maxZoom: 19
      }),
      'world-grayscale': L.tileLayer(ESRI_WORLD_GRAYSCALE_URL, {
        attribution: ESRI_GRAYSCALE_ATTRIBUTION,
        maxZoom: 16
      }),
      'openstreetmap': L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19
      }),
      'opentopomap': L.tileLayer(OPENTOPOMAP_URL, {
        attribution: OPENTOPOMAP_ATTRIBUTION,
        maxZoom: 17
      })
    }

    this.baseLayers = baseLayers
    this.setBaseLayer('world-imagery') // Capa por defecto
  }

  setBaseLayer(layerId) {
    if (this.baseLayer) {
      this.map.removeLayer(this.baseLayer)
    }

    this.baseLayer = this.baseLayers[layerId]
    this.currentBaseLayerId = layerId // Update current layer ID
    this.map.addLayer(this.baseLayer)
  }

  getCurrentBaseLayerId() {
    return this.currentBaseLayerId
  }

  getBaseLayers() {
    return {
      'world-imagery': { name: 'Satélite', id: 'world-imagery' },
      'world-street': { name: 'Calles', id: 'world-street' },
      'world-topo': { name: 'Topográfico', id: 'world-topo' },
      'world-grayscale': { name: 'Escala de Grises', id: 'world-grayscale' },
      'openstreetmap': { name: 'OpenStreetMap', id: 'openstreetmap' },
      'opentopomap': { name: 'OpenTopoMap', id: 'opentopomap' }
    }
  }

  async addWFSLayer(layerId, url, options = {}) {
    try {
      console.log(`Cargando capa WFS: ${layerId} desde ${url}`)
      const response = await fetch(url)

      if (!response.ok) {
        console.error('Error al obtener GeoJSON:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const geojsonData = await response.json()

      if (!geojsonData || !geojsonData.features?.length) {
        console.warn('GeoJSON no contiene features.')
        return null
      }

      console.log(`GeoJSON cargado exitosamente: ${geojsonData.features.length} features`)

      const defaultStyle = {
        color: '#16a34a',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.3
      }

      // Configuración específica para suelos con colores por textura
      const texturaColors = {
        a: '#2d2139',
        aF: '#7fa7c5',
        F: '#3ecfc6',
        Fa: '#8eea70',
        FA: '#c2e96a',
        FAa: '#e3a23c',
        FL: '#a34b0e',
        Si: '#2d1e1b'
      }

      const layerConfig = {
        style: feature => {
          // Estilo para polígonos
          return { ...defaultStyle, ...options.style }
        },
        pointToLayer: (feature, latlng) => {
          // Manejo específico para puntos
          const nombre = feature.properties.h1_text || feature.properties.textura || 'Si'
          const color = texturaColors[nombre] || '#888'

          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: color,
            color: '#222',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
          })
        },
        onEachFeature: (feature, layer) => {
          if (options.onEachFeature) {
            options.onEachFeature(feature, layer)
          } else {
            // Popup por defecto con propiedades
            let popupContent = '<div class="font-semibold mb-2 text-amber-600">Información del Suelo</div>'
            const props = feature.properties

            // Mostrar propiedades más relevantes primero
            if (props.h1_text) popupContent += `<div><strong>Textura:</strong> ${props.h1_text}</div>`
            if (props.nombre) popupContent += `<div><strong>Nombre:</strong> ${props.nombre}</div>`
            if (props.tipo) popupContent += `<div><strong>Tipo:</strong> ${props.tipo}</div>`
            if (props.area) popupContent += `<div><strong>Área:</strong> ${props.area}</div>`

            // Agregar otras propiedades importantes
            for (const [key, value] of Object.entries(props)) {
              if (!['h1_text', 'nombre', 'tipo', 'area'].includes(key) && value !== null && value !== '') {
                popupContent += `<div><strong>${key}:</strong> ${value}</div>`
              }
            }

            layer.bindPopup(popupContent)
          }
        }
      }

      // Aplicar configuraciones adicionales si se proporcionan
      if (options.pointToLayer) {
        layerConfig.pointToLayer = options.pointToLayer
      }
      if (options.style) {
        layerConfig.style = feature => ({ ...defaultStyle, ...options.style })
      }

      const layer = L.geoJSON(geojsonData, layerConfig)

      this.layers.set(layerId, layer)
      console.log(`Capa ${layerId} creada exitosamente`)
      return layer
    } catch (error) {
      console.error(`Error loading WFS layer ${layerId}:`, error)
      throw error
    }
  }

  addLayer(layerId) {
    const layer = this.layers.get(layerId)
    if (layer && this.map) {
      layer.addTo(this.map)
    }
  }

  removeLayer(layerId) {
    const layer = this.layers.get(layerId)
    if (layer && this.map) {
      this.map.removeLayer(layer)
    }
  }

  toggleLayer(layerId) {
    const layer = this.layers.get(layerId)
    if (layer && this.map) {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer)
        return false
      } else {
        layer.addTo(this.map)
        return true
      }
    }
    return false
  }

  hasLayer(layerId) {
    const layer = this.layers.get(layerId)
    return layer && this.map && this.map.hasLayer(layer)
  }

  addControl(position, element) {
    const CustomControl = L.Control.extend({
      onAdd: () => element
    })

    return new CustomControl({ position }).addTo(this.map)
  }

  updateScale() {
    const scale = this.map.getZoom()
    // Convertir el zoom a una escala aproximada
    return `1:${Math.round(559082264.028 / Math.pow(2, scale))}`
  }

  getCenter() {
    const center = this.map.getCenter()
    return {
      lat: center.lat.toFixed(6),
      lng: center.lng.toFixed(6)
    }
  }

  zoomIn() {
    this.map.zoomIn()
  }

  zoomOut() {
    this.map.zoomOut()
  }

  zoomToHome() {
    this.map.setView(this.initialCenter, this.initialZoom)
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.map.getContainer().requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  }
}

export const mapService = new MapService()
