<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { mapService } from '@/services/mapService'
import { layerService } from '@/services/layerService'
import { useLayerStore } from '@/stores/layerStore'
import { GEOSERVER_WFS_SUELO_URL, GEOSERVER_WFS_RIOS_URL, GEOSERVER_WFS_PERIMETRO_URL, GEOSERVER_WFS_EMBALSE_URL } from '@/urls'
import L from 'leaflet'

const { isDarkMode } = useDarkMode()
const store = useLayerStore()
const mapCoordinates = ref('Mueve el cursor sobre el mapa')
const scale = ref('1:140,000')
const mapRef = ref(null)

// Configuración inicial del mapa (Región de Canoabo, Carabobo, Venezuela)
const INITIAL_CENTER = [10.3316, -68.2833] // Coordenadas aproximadas de Canoabo
const INITIAL_ZOOM = 12

const updateCoordinates = (event) => {
  if (event.latlng) {
    const lat = event.latlng.lat.toFixed(6)
    const lon = event.latlng.lng.toFixed(6)
    mapCoordinates.value = `Lat: ${lat}, Lon: ${lon}`
  }
}

const updateScale = () => {
  if (mapService.map) {
    scale.value = mapService.updateScale()
  }
}

const zoomIn = () => {
  mapService.zoomIn()
}

const zoomOut = () => {
  mapService.zoomOut()
}

const zoomToHome = () => {
  mapService.zoomToHome()
}

const toggleFullscreen = () => {
  mapService.toggleFullscreen()
}

const loadRiosLayer = (map) => {
  // Cargar capa WFS de ríos
  try {
    fetch(GEOSERVER_WFS_RIOS_URL)
      .then(res => {
        if (!res.ok) {
          return null
        }
        return res.json()
      })
      .then(geojson => {
        if (!geojson || !geojson.features?.length) {
          return
        }

        // Validar geometrías antes de crear la capa
        const validFeatures = geojson.features.filter(feature => {
          const geom = feature.geometry
          if (!geom) {
            return false
          }

          if (!['LineString', 'MultiLineString'].includes(geom.type)) {
            return false
          }

          // Validar que tiene coordenadas
          if (geom.type === 'LineString' && (!geom.coordinates || geom.coordinates.length < 2)) {
            return false
          }

          if (geom.type === 'MultiLineString' && (!geom.coordinates || geom.coordinates.length === 0)) {
            return false
          }

          return true
        })

        if (validFeatures.length === 0) {
          return
        }

        // Crear GeoJSON con features válidas
        const validGeoJSON = {
          type: 'FeatureCollection',
          features: validFeatures
        }

        try {
          const riosLayer = L.geoJSON(validGeoJSON, {
            style: (feature) => {
              const weight = 3
              const color = '#0538ff'

              return {
                color: color,
                weight: weight,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }
            },
            onEachFeature(feature, layer) {
              const props = feature.properties || {}
              const nombre = props.nombre || props.name || props.Name || 'Río sin nombre'
              const tipo = props.tipo || props.type || props.Type || 'Curso de agua'

              layer.on('click', () => {
                const popupContent = `
                  <div style="min-width:180px; font-family:sans-serif;">
                    <div style="font-size:1.1em;font-weight:bold;color:#1d4ed8;margin-bottom:4px;">
                      ${nombre}
                    </div>
                    <div><b>Tipo:</b> ${tipo}</div>
                    <div><b>Geometría:</b> ${feature.geometry?.type || '-'}</div>
                    <div><b>Longitud:</b> ${props.longitud || props.length || props.Length || '-'}</div>
                    <div><b>Cuenca:</b> ${props.cuenca || props.basin || props.Basin || 'Canoabo'}</div>
                    <div><b>ID:</b> ${props.id || props.gml_id || props.fid || '-'}</div>
                  </div>`

                layer.bindPopup(popupContent).openPopup()
                store.currentLayerId = 'rios-wfs'
                store.attributePanelVisible = true
              })

              layer.on('mouseover', (e) => {
                e.target.setStyle({
                  weight: 5,  // Aumentar de 3 a 5 en hover
                  opacity: 1
                })
              })

              layer.on('mouseout', (e) => {
                e.target.setStyle({
                  weight: 3,  // Volver a 3px
                  opacity: 1
                })
              })
            }
          })

          // Primero agregamos al mapa
          riosLayer.addTo(map)

          // Verificar bounds
          const bounds = riosLayer.getBounds()

          // Traer al frente para asegurar visibilidad - DESPUÉS de los suelos
          riosLayer.bringToFront()

          // Guardar referencia
          mapService.layers.set('rios-wfs', riosLayer)

          // Forzar repintado múltiple
          map.invalidateSize()
          setTimeout(() => {
            map.invalidateSize()
            riosLayer.bringToFront()
          }, 100)
          setTimeout(() => {
            map.invalidateSize()
            riosLayer.bringToFront()
          }, 500)

        } catch (layerError) {
          // Error creando capa de ríos
        }
      })
      .catch(error => {
        // Error cargando capa WFS de ríos
      })
  } catch (error) {
    // Error en configuración de capa WFS de ríos
  }
}

const loadPerimetroLayer = (map) => {
  // Cargar capa WFS de perímetro
  try {
    fetch(GEOSERVER_WFS_PERIMETRO_URL)
      .then(res => {
        if (!res.ok) {
          return null
        }
        return res.json()
      })
      .then(geojson => {
        if (!geojson || !geojson.features?.length) {
          return
        }

        // Validar geometrías antes de crear la capa
        const validFeatures = geojson.features.filter(feature => {
          const geom = feature.geometry
          if (!geom) {
            return false
          }

          if (!['Polygon', 'MultiPolygon'].includes(geom.type)) {
            return false
          }

          // Validar que tiene coordenadas
          if (geom.type === 'Polygon' && (!geom.coordinates || geom.coordinates.length === 0)) {
            return false
          }

          if (geom.type === 'MultiPolygon' && (!geom.coordinates || geom.coordinates.length === 0)) {
            return false
          }

          return true
        })

        if (validFeatures.length === 0) {
          return
        }

        // Crear GeoJSON con features válidas
        const validGeoJSON = {
          type: 'FeatureCollection',
          features: validFeatures
        }

        try {
          const perimetroLayer = L.geoJSON(validGeoJSON, {
            style: (feature) => {
              return {
                color: '#dc2626',      // Rojo para el borde
                fillColor: '#dc2626',  // Rojo para el relleno
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.1,      // Muy transparente para no tapar otras capas
                lineCap: 'round',
                lineJoin: 'round'
              }
            },
            onEachFeature(feature, layer) {
              const props = feature.properties || {}
              const nombre = props.nombre || props.name || props.Name || 'Perímetro Canoabo'
              const area = props.area || props.Area || props.area_ha || 'N/A'

              layer.on('click', () => {
                const popupContent = `
                  <div style="min-width:180px; font-family:sans-serif;">
                    <div style="font-size:1.1em;font-weight:bold;color:#dc2626;margin-bottom:4px;">
                      ${nombre}
                    </div>
                    <div><b>Tipo:</b> Perímetro</div>
                    <div><b>Geometría:</b> ${feature.geometry?.type || '-'}</div>
                    <div><b>Área:</b> ${area}</div>
                    <div><b>Descripción:</b> ${props.descripcion || props.description || 'Límite territorial'}</div>
                    <div><b>ID:</b> ${props.id || props.gml_id || props.fid || '-'}</div>
                  </div>`

                layer.bindPopup(popupContent).openPopup()
                store.currentLayerId = 'perimetro-wfs'
                store.attributePanelVisible = true
              })

              layer.on('mouseover', (e) => {
                e.target.setStyle({
                  weight: 4,
                  fillOpacity: 0.2
                })
              })

              layer.on('mouseout', (e) => {
                e.target.setStyle({
                  weight: 2,
                  fillOpacity: 0.1
                })
              })
            }
          })

          // Agregar al mapa
          perimetroLayer.addTo(map)

          // Enviar al fondo para que no tape otras capas
          perimetroLayer.bringToBack()

          // Guardar referencia
          mapService.layers.set('perimetro-wfs', perimetroLayer)

          // Forzar repintado
          map.invalidateSize()

        } catch (layerError) {
          // Error creando capa de perímetro
        }
      })
      .catch(error => {
        // Error cargando capa WFS de perímetro
      })
  } catch (error) {
    // Error en configuración de capa WFS de perímetro
  }
}

const loadEmbalseLayer = (map) => {
  // Cargar capa WFS de embalse
  try {
    fetch(GEOSERVER_WFS_EMBALSE_URL)
      .then(res => {
        if (!res.ok) {
          return null
        }
        return res.json()
      })
      .then(geojson => {
        if (!geojson || !geojson.features?.length) {
          return
        }

        // Validar geometrías antes de crear la capa
        const validFeatures = geojson.features.filter(feature => {
          const geom = feature.geometry
          if (!geom) {
            return false
          }

          if (!['Point', 'Polygon', 'MultiPolygon'].includes(geom.type)) {
            return false
          }

          // Validar que tiene coordenadas
          if (geom.type === 'Point' && (!geom.coordinates || geom.coordinates.length < 2)) {
            return false
          }

          if (geom.type === 'Polygon' && (!geom.coordinates || geom.coordinates.length === 0)) {
            return false
          }

          if (geom.type === 'MultiPolygon' && (!geom.coordinates || geom.coordinates.length === 0)) {
            return false
          }

          return true
        })

        if (validFeatures.length === 0) {
          return
        }

        // Crear GeoJSON con features válidas
        const validGeoJSON = {
          type: 'FeatureCollection',
          features: validFeatures
        }

        try {
          const embalseLayer = L.geoJSON(validGeoJSON, {
            pointToLayer(feature, latlng) {
              // Para puntos, crear un marcador circular
              return L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#0ea5e9',
                color: '#0284c7',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
              })
            },
            style: (feature) => {
              // Para polígonos (cuerpos de agua)
              return {
                color: '#0284c7',      // Azul para el borde
                fillColor: '#0ea5e9',  // Azul claro para el relleno
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.6,
                lineCap: 'round',
                lineJoin: 'round'
              }
            },
            onEachFeature(feature, layer) {
              const props = feature.properties || {}
              const nombre = props.nombre || props.name || props.Name || 'Embalse'
              const tipo = props.tipo || props.type || props.Type || 'Cuerpo de agua'
              const capacidad = props.capacidad || props.capacity || props.volumen || 'N/A'

              layer.on('click', () => {
                const popupContent = `
                  <div style="min-width:180px; font-family:sans-serif;">
                    <div style="font-size:1.1em;font-weight:bold;color:#0284c7;margin-bottom:4px;">
                      ${nombre}
                    </div>
                    <div><b>Tipo:</b> ${tipo}</div>
                    <div><b>Geometría:</b> ${feature.geometry?.type || '-'}</div>
                    <div><b>Capacidad:</b> ${capacidad}</div>
                    <div><b>Estado:</b> ${props.estado || props.status || 'Activo'}</div>
                    <div><b>Cuenca:</b> ${props.cuenca || props.basin || 'Canoabo'}</div>
                    <div><b>ID:</b> ${props.id || props.gml_id || props.fid || '-'}</div>
                  </div>`

                layer.bindPopup(popupContent).openPopup()
                store.currentLayerId = 'embalse-wfs'
                store.attributePanelVisible = true
              })

              layer.on('mouseover', (e) => {
                if (e.target.setStyle) {
                  e.target.setStyle({
                    weight: 4,
                    fillOpacity: 0.8
                  })
                } else if (e.target.setRadius) {
                  // Para CircleMarkers
                  e.target.setRadius(10)
                }
              })

              layer.on('mouseout', (e) => {
                if (e.target.setStyle) {
                  e.target.setStyle({
                    weight: 2,
                    fillOpacity: 0.6
                  })
                } else if (e.target.setRadius) {
                  // Para CircleMarkers
                  e.target.setRadius(8)
                }
              })
            }
          })

          // Agregar al mapa
          embalseLayer.addTo(map)

          // Traer al frente para buena visibilidad
          embalseLayer.bringToFront()

          // Guardar referencia
          mapService.layers.set('embalse-wfs', embalseLayer)

          // Forzar repintado
          map.invalidateSize()

        } catch (layerError) {
          // Error creando capa de embalse
        }
      })
      .catch(error => {
        // Error cargando capa WFS de embalse
      })
  } catch (error) {
    // Error en configuración de capa WFS de embalse
  }
}

const initializeMap = async () => {
  await nextTick()

  if (!mapRef.value) return

  // Inicializar el mapa usando el servicio
  const map = mapService.initializeMap(mapRef.value, {
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM
  })

  // Eventos del mapa
  map.on('mousemove', updateCoordinates)
  map.on('zoomend', updateScale)
  map.on('moveend', updateScale)

  // Actualizar escala inicial
  updateScale()

  // Cargar capa WFS de suelos
  try {
    fetch(GEOSERVER_WFS_SUELO_URL)
      .then(res => {
        if (!res.ok) {
          console.error('Error al obtener GeoJSON de suelo:', res.status, res.statusText)
          return null
        }
        return res.json()
      })
      .then(geojson => {
        if (!geojson || !geojson.features?.length) {
          return
        }

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

        const sueloLayer = L.geoJSON(geojson, {
          pointToLayer(feature, latlng) {
            const nombre = feature.properties.h1_text || 'Si'
            const color = texturaColors[nombre] || '#888'
            return L.circleMarker(latlng, {
              radius: 5,
              fillColor: color,
              color: '#222',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.9
            })
          },
          onEachFeature(feature, layer) {
            const nombre = feature.properties.h1_text || ''
            const color = texturaColors[nombre] || '#888'

            layer.on('click', () => {
              const popupContent = `
                <div style="min-width:180px; font-family:sans-serif;">
                  <div style="font-size:1.1em;font-weight:bold;color:#d97706;margin-bottom:4px;">
                    ${feature.properties.nombre || 'Suelo Canoabo'}
                  </div>
                  <div><b>Textura:</b> <span style="color:${color};font-weight:bold;">
                    ${nombre || '-'}
                  </span></div>
                  <div><b>Capacidad Uso:</b> ${feature.properties.cuso || '-'}</div>
                  <div><b>ID:</b> ${feature.properties.id || feature.properties.gml_id || '-'}</div>
                </div>`

              layer.bindPopup(popupContent).openPopup()

              // Abrir panel de atributos
              store.currentLayerId = 'suelos-wfs'
              store.attributePanelVisible = true
            })
          }
        })

        // Guardar la capa en el mapService para el toggle
        mapService.layers.set('suelos-wfs', sueloLayer)
        sueloLayer.addTo(map)
        sueloLayer.bringToFront()

        // Ajustar vista a la capa si tiene bounds válidos
        const bounds = sueloLayer.getBounds()
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds)
        }

        // CARGAR RÍOS DESPUÉS DE LOS SUELOS
        loadRiosLayer(map)

        // CARGAR PERÍMETRO DESPUÉS DE LOS RÍOS
        loadPerimetroLayer(map)

        // CARGAR EMBALSE DESPUÉS DEL PERÍMETRO
        loadEmbalseLayer(map)
      })
      .catch(error => {
        console.error('Error cargando capa WFS de suelos:', error)
      })
  } catch (error) {
    console.error('Error en configuración de capa WFS de suelos:', error)
  }
}

onMounted(() => {
  initializeMap()
})

// Watcher para manejar el toggle de capas
watch(() => store.selectedLayers, (newLayers, oldLayers) => {
  if (mapService.map) {
    // Detectar qué capas se agregaron o removieron
    const added = [...newLayers].filter(layer => !oldLayers || !oldLayers.has(layer))
    const removed = oldLayers ? [...oldLayers].filter(layer => !newLayers.has(layer)) : []

    // Agregar nuevas capas
    added.forEach(layerId => {
      if (layerId === 'suelos-wfs' || layerId === 'rios-wfs' || layerId === 'perimetro-wfs' || layerId === 'embalse-wfs') {
        mapService.addLayer(layerId)
      }
    })

    // Remover capas
    removed.forEach(layerId => {
      if (layerId === 'suelos-wfs' || layerId === 'rios-wfs' || layerId === 'perimetro-wfs' || layerId === 'embalse-wfs') {
        mapService.removeLayer(layerId)
      }
    })
  }
}, { deep: true })

onUnmounted(() => {
  mapService.destroy()
})
</script>

<template>
  <div class="h-full relative">
    <!-- Mapa -->
    <div
      ref="mapRef"
      id="map"
      class="absolute inset-0 bg-geo-background z-0"
      @mousemove="updateCoordinates"
    ></div>

    <!-- Controles del mapa -->
    <div class="absolute top-4 right-4 space-y-2 z-10">
      <div class="bg-geo-background rounded-lg shadow-lg border border-geo-border">
        <button
          @click="zoomIn"
          class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-t-lg"
          title="Acercar"
        >
          <i class="fas fa-plus text-geo-text/60 text-sm"></i>
        </button>
        <div class="border-t border-geo-border"></div>
        <button
          @click="zoomOut"
          class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-b-lg"
          title="Alejar"
        >
          <i class="fas fa-minus text-geo-text/60 text-sm"></i>
        </button>
      </div>

      <div class="bg-geo-background rounded-lg shadow-lg border border-geo-border">
        <button
          @click="zoomToHome"
          class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-lg"
          title="Vista inicial"
        >
          <i class="fas fa-home text-geo-text/60 text-sm"></i>
        </button>
      </div>

      <div class="bg-geo-background rounded-lg shadow-lg border border-geo-border">
        <button
          @click="toggleFullscreen"
          class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-lg"
          title="Pantalla completa"
        >
          <i class="fas fa-expand text-geo-text/60 text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Información de escala -->
    <div class="absolute bottom-4 left-4 bg-geo-background/90 backdrop-blur-sm rounded-md shadow-lg border border-geo-border px-2 py-1 z-10">
      <div class="flex items-center space-x-2">
        <i class="fas fa-ruler text-geo-text/60 text-xs"></i>
        <span class="text-xs text-geo-text">Escala {{ scale }}</span>
      </div>
    </div>

    <!-- Información de coordenadas -->
    <div class="absolute bottom-4 right-4 bg-geo-background/90 backdrop-blur-sm rounded-md shadow-lg border border-geo-border px-2 py-1 z-10">
      <div class="flex items-center space-x-2">
        <i class="fas fa-crosshairs text-geo-text/60 text-xs"></i>
        <span class="text-xs text-geo-text">{{ mapCoordinates }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para el mapa Leaflet */
#map {
  height: 100%;
  width: 100%;
}

/* Asegurar que los controles de Leaflet se vean correctamente */
:deep(.leaflet-control-container) {
  pointer-events: auto;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-tip) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Ajustar colores de popup en modo oscuro */
.dark :deep(.leaflet-popup-content-wrapper) {
  background-color: #374151;
  color: #f3f4f6;
}

.dark :deep(.leaflet-popup-tip) {
  background-color: #374151;
}
</style>
