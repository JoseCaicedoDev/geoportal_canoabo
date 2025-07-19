<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLayerStore } from '@/stores/layerStore'
import LayerContextMenu from './LayerContextMenu.vue'

const { isDarkMode } = useDarkMode()
const store = useLayerStore()
const selectedBaseLayer = ref('world-imagery')
const openAccordions = ref(new Set(['base-layers', 'data-layers'])) // Inicializar con ambos acordeones abiertos
const baseLayers = ref({})

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

// Ocultar menú contextual al hacer clic fuera o al cambiar de ventana
const handleClickOutside = (event) => {
  if (!event.target.closest('.context-menu')) {
    store.hideContextMenu()
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('blur', store.hideContextMenu)

  // Intentar obtener mapService con reintentos
  const checkMapService = () => {
    if (window.mapService) {
      mapService = window.mapService
      baseLayers.value = mapService.getBaseLayers()
      // Sincronizar con la capa base actual
      selectedBaseLayer.value = mapService.getCurrentBaseLayerId()
      console.log('MapService conectado, capas base cargadas:', baseLayers.value)
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
              <button
                class="text-xs text-geo-primary hover:text-green-600 transition-colors p-1"
                @click.stop="() => {}"
              >
                <i class="fas fa-plus"></i>
              </button>
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

        <!-- Acordeón de Hidrología -->
        <div class="space-y-2">
          <div class="border border-geo-border rounded-lg">
            <div
              class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
              @click="toggleAccordion('hydrology')"
            >
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-blue-500 rounded"></div>
                <span class="text-sm font-medium text-geo-text">Hidrología</span>
              </div>
              <i :class="[
                'fas fa-chevron-down text-geo-text/60 transform transition-transform',
                openAccordions.has('hydrology') ? 'rotate-180' : ''
              ]"></i>
            </div>
            <div
              v-show="openAccordions.has('hydrology')"
              class="border-t border-geo-border p-3 space-y-2 bg-geo-hover/50"
            >
              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-geo-secondary focus:ring-geo-secondary"
                    :checked="store.selectedLayers.has('rio-canoabo')"
                    @change="store.toggleLayer('rio-canoabo')"
                  >
                  <span class="text-sm text-geo-text">Río Canoabo</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'rio-canoabo')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-geo-secondary focus:ring-geo-secondary"
                    :checked="store.selectedLayers.has('afluentes')"
                    @change="store.toggleLayer('afluentes')"
                  >
                  <span class="text-sm text-geo-text">Afluentes</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'afluentes')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-geo-secondary focus:ring-geo-secondary"
                    :checked="store.selectedLayers.has('cuenca')"
                    @change="store.toggleLayer('cuenca')"
                  >
                  <span class="text-sm text-geo-text">Cuenca</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'cuenca')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Leyenda de Hidrología -->
              <div class="mt-3 pt-3 border-t border-geo-border">
                <div class="space-y-1 text-sm">
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-1 bg-blue-500 rounded-full"></div>
                    <span class="text-geo-text/70">Ríos / Cuerpos de Agua</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acordeón de Geología -->
          <div class="border border-geo-border rounded-lg">
            <div
              class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
              @click="toggleAccordion('geology')"
            >
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-amber-500 rounded"></div>
                <span class="text-sm font-medium text-geo-text">Geología</span>
              </div>
              <i :class="[
                'fas fa-chevron-down text-geo-text/60 transform transition-transform',
                openAccordions.has('geology') ? 'rotate-180' : ''
              ]"></i>
            </div>
            <div
              v-show="openAccordions.has('geology')"
              class="border-t border-geo-border p-3 space-y-2 bg-geo-hover/50"
            >
              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-geo-accent focus:ring-geo-accent"
                    :checked="store.selectedLayers.has('formaciones')"
                    @change="store.toggleLayer('formaciones')"
                  >
                  <span class="text-sm text-geo-text">Formaciones rocosas</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'formaciones')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-geo-accent focus:ring-geo-accent"
                    :checked="store.selectedLayers.has('suelos')"
                    @change="store.toggleLayer('suelos')"
                  >
                  <span class="text-sm text-geo-text">Tipos de suelo</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'suelos')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-geo-accent focus:ring-geo-accent"
                    :checked="store.selectedLayers.has('suelos-wfs')"
                    @change="store.toggleLayer('suelos-wfs')"
                  >
                  <span class="text-sm text-geo-text">Suelos Canoabo (WFS)</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'suelos-wfs')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Leyenda de Geología -->
              <div class="mt-3 pt-3 border-t border-geo-border">
                <div class="space-y-1 text-sm">
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 bg-amber-500 rounded-full"></div>
                    <span class="text-geo-text/70">Tipos de Suelo</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 bg-yellow-700 rounded-full"></div>
                    <span class="text-geo-text/70">Formaciones Rocosas</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span class="text-geo-text/70">Suelos WFS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acordeón de Asentamientos -->
          <div class="border border-geo-border rounded-lg">
            <div
              class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
              @click="toggleAccordion('settlements')"
            >
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-red-500 rounded"></div>
                <span class="text-sm font-medium text-geo-text">Asentamientos</span>
              </div>
              <i :class="[
                'fas fa-chevron-down text-geo-text/60 transform transition-transform',
                openAccordions.has('settlements') ? 'rotate-180' : ''
              ]"></i>
            </div>
            <div
              v-show="openAccordions.has('settlements')"
              class="border-t border-geo-border p-3 space-y-2 bg-geo-hover/50"
            >
              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-red-500 focus:ring-red-500"
                    :checked="store.selectedLayers.has('centros-poblados')"
                    @change="store.toggleLayer('centros-poblados')"
                  >
                  <span class="text-sm text-geo-text">Centros poblados</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'centros-poblados')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between group">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    class="text-red-500 focus:ring-red-500"
                    :checked="store.selectedLayers.has('vias')"
                    @change="store.toggleLayer('vias')"
                  >
                  <span class="text-sm text-geo-text">Vías</span>
                </label>
                <div class="relative">
                  <button
                    class="opacity-0 group-hover:opacity-100 text-geo-text/60 hover:text-geo-text transition-all"
                    @click="showContextMenu($event, 'vias')"
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Leyenda de Asentamientos -->
              <div class="mt-3 pt-3 border-t border-geo-border">
                <div class="space-y-1 text-sm">
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span class="text-geo-text/70">Centros Poblados</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 bg-gray-600 rounded-full"></div>
                    <span class="text-geo-text/70">Vías</span>
                  </div>
                </div>
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
    <footer class="bg-geo-dark p-4 mt-auto dark:bg-geo-dark/50">
      <div class="flex flex-col items-center space-y-3">
        <div class="flex items-center space-x-2">
          <p class="text-sm text-geo-text/80">© 2024 GeoCanoabo - Powered by Gira360</p>
        </div>
        <div class="flex items-center space-x-2">
          <i class="fab fa-leaflet text-geo-primary"></i>
          <span class="text-sm text-geo-text/80">Leaflet</span>
        </div>
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <button class="text-sm text-geo-text/80 hover:text-geo-primary transition-colors">
            <i class="fas fa-download mr-1"></i>
            Descargar datos
          </button>
          <button class="text-sm text-geo-text/80 hover:text-geo-primary transition-colors">
            <i class="fas fa-share-alt mr-1"></i>
            Compartir
          </button>
          <button class="text-sm text-geo-text/80 hover:text-geo-primary transition-colors">
            <i class="fas fa-question-circle mr-1"></i>
            Ayuda
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>
