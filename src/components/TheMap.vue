<script setup>
import { ref, onMounted } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDarkMode } = useDarkMode()
const mapCoordinates = ref('Mueve el cursor sobre el mapa')
const scale = ref('1:140,000')

const updateCoordinates = (event) => {
  // TO-DO: Implementar lógica real de coordenadas con Leaflet
  const lat = (10.5 + Math.random() * 0.1).toFixed(6)
  const lon = (-67.8 + Math.random() * 0.1).toFixed(6)
  mapCoordinates.value = `Lat: ${lat}, Lon: ${lon}`
}

onMounted(() => {
  // TO-DO: Inicializar mapa Leaflet
})
</script>

<template>
  <div class="h-full relative">
    <!-- Mapa -->
    <div id="map" class="absolute inset-0 bg-geo-background">
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br"
           :class="isDarkMode ? 'from-green-950/20 to-blue-950/20' : 'from-green-100 to-blue-100'">
        <div class="text-center">
          <i class="fas fa-map text-6xl text-geo-primary mb-4"></i>
          <h2 class="text-xl font-semibold text-geo-text mb-2">Mapa Interactivo</h2>
          <p class="text-geo-text/60">Cuenca del Río Canoabo, Estado Carabobo</p>
        </div>
      </div>
    </div>

    <!-- Controles del mapa -->
    <div class="absolute top-4 right-4 space-y-2 z-10">
      <div class="bg-geo-background rounded-lg shadow-lg border border-geo-border">
        <button class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors">
          <i class="fas fa-plus text-geo-text/60 text-sm"></i>
        </button>
        <div class="border-t border-geo-border"></div>
        <button class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors">
          <i class="fas fa-minus text-geo-text/60 text-sm"></i>
        </button>
      </div>

      <div class="bg-geo-background rounded-lg shadow-lg border border-geo-border">
        <button class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors">
          <i class="fas fa-home text-geo-text/60 text-sm"></i>
        </button>
      </div>

      <div class="bg-geo-background rounded-lg shadow-lg border border-geo-border">
        <button class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors">
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
