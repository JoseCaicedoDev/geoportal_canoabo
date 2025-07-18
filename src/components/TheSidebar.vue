<script setup>
import { ref } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDarkMode } = useDarkMode()
const selectedBaseLayer = ref('satellite')
const openAccordions = ref(new Set())

const toggleAccordion = (id) => {
  if (openAccordions.value.has(id)) {
    openAccordions.value.delete(id)
  } else {
    openAccordions.value.add(id)
  }
}

const showContextMenu = (event, layerId) => {
  // Implementar lógica del menú contextual
  event.preventDefault()
  event.stopPropagation()
  // TO-DO: Implementar menú contextual
}
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
      <div class="p-4">
        <h3 class="font-semibold text-geo-text mb-3 flex items-center">
          <i class="fas fa-map mr-2 text-geo-primary"></i>
          Capas Base
        </h3>
        <div class="space-y-2">
          <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-geo-hover cursor-pointer">
            <input
              type="radio"
              name="baseLayer"
              value="satellite"
              v-model="selectedBaseLayer"
              class="text-geo-primary focus:ring-geo-primary"
            >
            <span class="text-sm text-geo-text">Satélite</span>
          </label>
          <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-geo-hover cursor-pointer">
            <input
              type="radio"
              name="baseLayer"
              value="topographic"
              v-model="selectedBaseLayer"
              class="text-geo-primary focus:ring-geo-primary"
            >
            <span class="text-sm text-geo-text">Topográfico</span>
          </label>
          <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-geo-hover cursor-pointer">
            <input
              type="radio"
              name="baseLayer"
              value="streets"
              v-model="selectedBaseLayer"
              class="text-geo-primary focus:ring-geo-primary"
            >
            <span class="text-sm text-geo-text">Calles</span>
          </label>
        </div>
      </div>

      <!-- Capas de Datos -->
      <div class="p-4 border-t border-geo-border">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-geo-text flex items-center">
            <i class="fas fa-database mr-2 text-geo-secondary"></i>
            Capas de Datos
          </h3>
          <button class="text-xs text-geo-primary hover:text-green-600 transition-colors">
            <i class="fas fa-plus mr-1"></i>
            Agregar
          </button>
        </div>

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
                  <input type="checkbox" class="text-geo-secondary focus:ring-geo-secondary">
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
              <!-- Otros elementos de hidrología... -->
            </div>
          </div>

          <!-- Similar structure for Geology and Settlements -->
          <!-- ... -->
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
