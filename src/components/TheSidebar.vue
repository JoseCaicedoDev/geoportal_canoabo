<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLayerStore } from '@/stores/layerStore'
import { layerService } from '@/services/layerService'
import LayerContextMenu from './LayerContextMenu.vue'

const { isDarkMode } = useDarkMode()
const store = useLayerStore()
const selectedBaseLayer = ref('world-imagery')
const openAccordions = ref(new Set(['base-layers', 'data-layers'])) // Inicializar con ambos acordeones abiertos
const baseLayers = ref({})
const wfsLayerGroups = ref({})
const wfsLayers = ref({})

// Importar mapService para manejar capas base
let mapService = null

const toggleAccordion = (id) => {
  if (openAccordions.value.has(id)) {
    openAccordions.value.delete(id)
  } else {
    openAccordions.value.add(id)
  }
}

const showContextMenu = (event, layerId) => {
  store.showContextMenu(event, layerId)
}

// Cambiar capa base cuando el usuario selecciona una
const handleBaseLayerChange = (layerId) => {
  if (mapService && mapService.setBaseLayer) {
    mapService.setBaseLayer(layerId)
  }
}

// Watch para detectar cambios en la capa base seleccionada
watch(selectedBaseLayer, (newLayerId) => {
  handleBaseLayerChange(newLayerId)
})

// Funciones helper para las capas WFS
const getAllWfsLayers = () => {
  const allLayers = []
  Object.values(wfsLayerGroups.value).forEach(group => {
    allLayers.push(...group.layers)
  })
  return allLayers
}

const getLayerGroup = (layerId) => {
  return Object.values(wfsLayerGroups.value).find(group =>
    group.layers.includes(layerId)
  )
}

const getLayerColorClass = (layerId) => {
  const group = getLayerGroup(layerId)
  return group ? `text-${group.color} focus:ring-${group.color}` : 'text-geo-primary focus:ring-geo-primary'
}

const getLayerIndicatorClass = (layerId) => {
  const group = getLayerGroup(layerId)
  const geometryType = layerService.getLayerGeometryType(layerId)

  let baseColor = group ? group.color : 'geo-primary'

  // Diferentes formas según el tipo de geometría
  switch (geometryType) {
    case 'Point':
      return `w-3 h-3 bg-${baseColor} rounded-full` // Círculo para puntos
    case 'LineString':
      return `w-4 h-1 bg-${baseColor} rounded-sm` // Línea para linestrings
    case 'Polygon':
      return `w-3 h-3 bg-${baseColor} border border-${baseColor}` // Cuadrado para polígonos
    default:
      return `w-3 h-3 bg-${baseColor} rounded-full`
  }
}

// Función para obtener el ícono según el tipo de geometría
const getLayerIcon = (layerId) => {
  const geometryType = layerService.getLayerGeometryType(layerId)

  switch (geometryType) {
    case 'Point':
      return 'fas fa-circle'
    case 'LineString':
      return 'fas fa-minus'
    case 'Polygon':
      return 'fas fa-square'
    default:
      return 'fas fa-circle'
  }
}

// Función para obtener el color según el grupo de capa
const getLayerIconColor = (layerId) => {
  const group = getLayerGroup(layerId)

  // Para la capa de suelos, usar colores según textura
  if (layerId === 'suelos-wfs') {
    // Mostrar un color representativo para suelos (ámbar)
    return 'text-amber-600'
  }

  switch (group?.color) {
    case 'blue-500':
      return 'text-blue-500'
    case 'amber-500':
      return 'text-amber-500'
    case 'red-600':
      return 'text-red-600'
    default:
      return 'text-geo-primary'
  }
}

// Nueva función para mostrar la leyenda de colores de textura
const getTexturaColorIndicators = () => {
  return [
    { textura: 'a', color: '#2d2139', name: 'Arenoso' },
    { textura: 'aF', color: '#7fa7c5', name: 'Areno Franco' },
    { textura: 'F', color: '#3ecfc6', name: 'Franco' },
    { textura: 'Fa', color: '#8eea70', name: 'Franco Arenoso' },
    { textura: 'FA', color: '#c2e96a', name: 'Franco Arcilloso' },
    { textura: 'FL', color: '#e3a23c', name: 'Franco Limoso' },
    { textura: 'L', color: '#a34b0e', name: 'Limoso' },
    { textura: 'A', color: '#e78a9b', name: 'Arcilloso' }
  ]
}

// Manejar toggle de capas WFS con agregado/eliminación de GeoJSON
const handleLayerToggle = async (layerId) => {
  const isCurrentlySelected = store.selectedLayers.has(layerId)

  if (isCurrentlySelected) {
    // Quitar la capa del mapa
    if (mapService && mapService.removeLayer) {
      mapService.removeLayer(layerId)
    }
    store.toggleLayer(layerId) // Actualizar el store
  } else {
    // Agregar la capa al mapa
    if (mapService && mapService.hasLayer && !mapService.hasLayer(layerId)) {
      // Si la capa no existe en el mapa, cargarla primero
      try {
        const layerConfig = layerService.getLayerConfig(layerId)
        if (layerConfig && layerConfig.url) {
          // Para suelos, no pasamos el style para permitir que mapService maneje los colores
          const options = layerId === 'suelos-wfs' ? {
            onEachFeature: (feature, layer) => {
              // Popup básico para mostrar propiedades
              let popupContent = `<div class="font-semibold mb-2 text-geo-primary">${wfsLayers.value[layerId] || layerId}</div>`
              const props = feature.properties

              // Mostrar las primeras propiedades más relevantes
              const relevantProps = ['nombre', 'tipo', 'textura', 'h1_text', 'area']
              relevantProps.forEach(prop => {
                if (props[prop]) {
                  popupContent += `<div><strong>${prop}:</strong> ${props[prop]}</div>`
                }
              })

              // Agregar otras propiedades si hay espacio
              let count = 0
              for (const [key, value] of Object.entries(props)) {
                if (!relevantProps.includes(key) && value !== null && value !== '' && count < 3) {
                  popupContent += `<div><strong>${key}:</strong> ${value}</div>`
                  count++
                }
              }

              layer.bindPopup(popupContent)
            }
          } : {
            style: layerConfig.style,
            onEachFeature: (feature, layer) => {
              // Popup básico para mostrar propiedades
              let popupContent = `<div class="font-semibold mb-2 text-geo-primary">${wfsLayers.value[layerId] || layerId}</div>`
              const props = feature.properties

              // Mostrar las primeras propiedades más relevantes
              const relevantProps = ['nombre', 'tipo', 'textura', 'h1_text', 'area']
              relevantProps.forEach(prop => {
                if (props[prop]) {
                  popupContent += `<div><strong>${prop}:</strong> ${props[prop]}</div>`
                }
              })

              // Agregar otras propiedades si hay espacio
              let count = 0
              for (const [key, value] of Object.entries(props)) {
                if (!relevantProps.includes(key) && value !== null && value !== '' && count < 3) {
                  popupContent += `<div><strong>${key}:</strong> ${value}</div>`
                  count++
                }
              }

              layer.bindPopup(popupContent)
            }
          }

          await mapService.addWFSLayer(layerId, layerConfig.url, options)

          // Agregar la capa al mapa para que sea visible
          mapService.addLayer(layerId)
        }
      } catch (error) {
        console.error(`Error al cargar la capa ${layerId}:`, error)
        return // No actualizar el store si hay error
      }
    } else {
      // Si la capa ya existe, solo agregarla al mapa
      if (mapService && mapService.addLayer) {
        mapService.addLayer(layerId)
      }
    }

    store.toggleLayer(layerId) // Actualizar el store
  }
}

// Función para cargar capas por defecto
const loadDefaultLayers = async () => {
  const defaultLayers = ['suelos-wfs', 'perimetro-wfs']

  for (const layerId of defaultLayers) {
    if (mapService && mapService.hasLayer && !mapService.hasLayer(layerId)) {
      try {
        const layerConfig = layerService.getLayerConfig(layerId)
        if (layerConfig && layerConfig.url) {
          // Para forzar la recarga, especialmente para suelos, no pasamos el style que pueda interferir
          const options = layerId === 'suelos-wfs' ? {
            onEachFeature: (feature, layer) => {
              // Popup básico para mostrar propiedades
              let popupContent = `<div class="font-semibold mb-2 text-geo-primary">${wfsLayers.value[layerId] || layerId}</div>`
              const props = feature.properties

              // Mostrar las primeras propiedades más relevantes
              const relevantProps = ['nombre', 'tipo', 'textura', 'h1_text', 'area']
              relevantProps.forEach(prop => {
                if (props[prop]) {
                  popupContent += `<div><strong>${prop}:</strong> ${props[prop]}</div>`
                }
              })

              // Agregar otras propiedades si hay espacio
              let count = 0
              for (const [key, value] of Object.entries(props)) {
                if (!relevantProps.includes(key) && value !== null && value !== '' && count < 3) {
                  popupContent += `<div><strong>${key}:</strong> ${value}</div>`
                  count++
                }
              }

              layer.bindPopup(popupContent)
            }
          } : {
            style: layerConfig.style,
            onEachFeature: (feature, layer) => {
              // Popup básico para mostrar propiedades
              let popupContent = `<div class="font-semibold mb-2 text-geo-primary">${wfsLayers.value[layerId] || layerId}</div>`
              const props = feature.properties

              // Mostrar las primeras propiedades más relevantes
              const relevantProps = ['nombre', 'tipo', 'textura', 'h1_text', 'area']
              relevantProps.forEach(prop => {
                if (props[prop]) {
                  popupContent += `<div><strong>${prop}:</strong> ${props[prop]}</div>`
                }
              })

              // Agregar otras propiedades si hay espacio
              let count = 0
              for (const [key, value] of Object.entries(props)) {
                if (!relevantProps.includes(key) && value !== null && value !== '' && count < 3) {
                  popupContent += `<div><strong>${key}:</strong> ${value}</div>`
                  count++
                }
              }

              layer.bindPopup(popupContent)
            }
          }

          // Crear la capa WFS
          await mapService.addWFSLayer(layerId, layerConfig.url, options)

          // Agregar la capa al mapa para que sea visible
          mapService.addLayer(layerId)
          console.log(`Capa por defecto cargada y agregada al mapa: ${layerId}`)
        }
      } catch (error) {
        console.error(`Error al cargar la capa por defecto ${layerId}:`, error)
      }
    }
  }

  // Ajustar vista a las capas cargadas después de un breve delay
  setTimeout(() => {
    if (mapService && mapService.zoomToHome) {
      mapService.zoomToHome()
    }
  }, 1000)
}// Ocultar menú contextual al hacer clic fuera o al cambiar de ventana
const handleClickOutside = (event) => {
  if (!event.target.closest('.context-menu')) {
    store.hideContextMenu()
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('blur', store.hideContextMenu)

  // Cargar capas WFS del layerService
  wfsLayerGroups.value = layerService.getLayerGroups()
  wfsLayers.value = layerService.getLayerDisplayNames()

  // Intentar obtener mapService con reintentos
  const checkMapService = async () => {
    if (window.mapService) {
      mapService = window.mapService
      baseLayers.value = mapService.getBaseLayers()
      // Sincronizar con la capa base actual
      selectedBaseLayer.value = mapService.getCurrentBaseLayerId()
      console.log('MapService conectado, capas base cargadas:', baseLayers.value)
      console.log('Capas WFS cargadas:', wfsLayerGroups.value)

      // Cargar capas por defecto una vez que mapService esté disponible
      await loadDefaultLayers()
    } else {
      // Reintentar después de un breve delay
      setTimeout(checkMapService, 100)
    }
  }

  checkMapService()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('blur', store.hideContextMenu)
})
</script>

<template>
  <div class="h-full bg-geo-background shadow-xl border-r border-geo-border flex flex-col dark:bg-geo-dark">
    <!-- Tabs de navegación -->
    <div class="flex border-b border-geo-border">
      <button class="flex-1 py-2 px-3 text-sm font-medium text-geo-primary border-b-2 border-geo-primary bg-geo-hover/50">
        <i class="fas fa-layer-group mr-1"></i>
        Capas
      </button>
      <button class="flex-1 py-2 px-3 text-sm font-medium text-geo-text/60 hover:text-geo-primary transition-colors">
        <i class="fas fa-chart-bar mr-1"></i>
        Análisis
      </button>
      <button class="flex-1 py-2 px-3 text-sm font-medium text-geo-text/60 hover:text-geo-primary transition-colors">
        <i class="fas fa-info-circle mr-1"></i>
        Info
      </button>
    </div>

    <!-- Contenido del sidebar -->
    <div class="flex-1 overflow-y-auto">
      <!-- Capas Base -->
        <div class="border border-geo-border rounded-lg">
          <div
            class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
            @click="toggleAccordion('base-layers')"
          >
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 bg-geo-primary rounded"></div>
              <span class="text-sm font-medium text-geo-text">Capas Base</span>
            </div>
            <i :class="[
              'fas fa-chevron-down text-geo-text/60 transform transition-transform',
              openAccordions.has('base-layers') ? 'rotate-180' : ''
            ]"></i>
          </div>
          <div
            v-show="openAccordions.has('base-layers')"
            class="border-t border-geo-border p-3 space-y-2 bg-geo-hover/50"
          >
            <label
              v-for="(layer, layerId) in baseLayers"
              :key="layerId"
              class="flex items-center space-x-3 rounded-lg hover:bg-geo-hover cursor-pointer"
            >
              <input
                type="radio"
                name="baseLayer"
                :value="layerId"
                v-model="selectedBaseLayer"
                class="text-geo-primary focus:ring-geo-primary"
              >
              <span class="text-sm text-geo-text">{{ layer.name }}</span>
            </label>
          </div>
        </div>


      <!-- Capas de Datos -->
        <div class="border border-geo-border rounded-lg">
          <div
            class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
            @click="toggleAccordion('data-layers')"
          >
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 bg-geo-secondary rounded"></div>
              <span class="text-sm font-medium text-geo-text">Capas de Datos</span>
            </div>
            <div class="flex items-center space-x-2">
              <i :class="[
                'fas fa-chevron-down text-geo-text/60 transform transition-transform',
                openAccordions.has('data-layers') ? 'rotate-180' : ''
              ]"></i>
            </div>
          </div>
          <div
            v-show="openAccordions.has('data-layers')"
            class="border-t border-geo-border p-3 bg-geo-hover/50"
          >

        <!-- Lista plana de capas WFS sin acordeones anidados -->
        <div class="space-y-3">
          <div
            v-for="layerId in getAllWfsLayers()"
            :key="layerId"
            class="relative group p-3 rounded-lg border border-geo-border/30 hover:bg-geo-hover hover:border-geo-border transition-all"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3 flex-1">
                <input
                  type="checkbox"
                  :class="getLayerColorClass(layerId)"
                  :checked="store.selectedLayers.has(layerId)"
                  @change="handleLayerToggle(layerId)"
                  class="mt-0.5"
                >
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-geo-text">{{ wfsLayers[layerId] || layerId }}</span>
                  <!-- Ícono del tipo de geometría debajo del nombre (excepto para suelos) - solo cuando está activa -->
                  <div v-if="layerId !== 'suelos-wfs' && store.selectedLayers.has(layerId)" class="mt-1">
                    <i :class="[getLayerIcon(layerId), getLayerIconColor(layerId), 'text-xs']"></i>
                  </div>
                  <!-- Leyenda de texturas para suelos en lugar del ícono - solo cuando está activa -->
                  <div v-if="layerId === 'suelos-wfs' && store.selectedLayers.has(layerId)" class="mt-2">
                    <div class="space-y-1">
                      <div
                        v-for="textura in getTexturaColorIndicators()"
                        :key="textura.textura"
                        class="flex items-center space-x-2"
                      >
                        <div
                          class="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0"
                          :style="{ backgroundColor: textura.color }"
                        ></div>
                        <span class="text-xs text-geo-text/80">{{ textura.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <!-- Menú de opciones -->
                <button
                  class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-geo-hover/50 text-geo-text/60 hover:text-geo-text transition-all"
                  @click="showContextMenu($event, layerId)"
                >
                  <i class="fas fa-ellipsis-v text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Menú contextual -->
        <LayerContextMenu
          v-if="store.activeContextMenu"
          :show="!!store.activeContextMenu"
          :layerId="store.activeContextMenu?.layerId"
          :position="{
            x: store.activeContextMenu?.x,
            y: store.activeContextMenu?.y
          }"
          class="context-menu"
        />
          </div>
        </div>
      </div>

    <!-- Footer -->
    <footer class="bg-geo-dark p-2 mt-auto dark:bg-geo-dark/50">
        <div class="flex items-center space-x-2">
          <p class="text-sm text-geo-text/80">© 2024 GeoCanoabo - Powered by Gira360</p>
        </div>
    </footer>
  </div>
</template>
