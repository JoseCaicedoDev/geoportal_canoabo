import L from 'leaflet'

class MapService {
  constructor() {
    this.map = null
    this.layers = new Map()
    this.baseLayer = null
  }

  initializeMap(containerId, options = {}) {
    const defaultOptions = {
      center: [10.5, -67.8], // Coordenadas de Canoabo
      zoom: 13,
      zoomControl: false // Desactivamos los controles por defecto
    }

    this.map = L.map(containerId, { ...defaultOptions, ...options })

    // Añadir capas base
    this.initializeBaseLayers()

    return this.map
  }

  initializeBaseLayers() {
    const baseLayers = {
      'satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      'streets': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }),
      'topographic': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap contributors'
      })
    }

    this.baseLayers = baseLayers
    this.setBaseLayer('satellite') // Capa por defecto
  }

  setBaseLayer(layerId) {
    if (this.baseLayer) {
      this.map.removeLayer(this.baseLayer)
    }

    this.baseLayer = this.baseLayers[layerId]
    this.map.addLayer(this.baseLayer)
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
    this.map.setView([10.5, -67.8], 13)
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
