<script setup>
import { ref, onMounted } from 'vue'

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
    <div id="map" class="absolute inset-0 bg-gray-200">
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div class="text-center">
          <i class="fas fa-map text-6xl text-geo-primary mb-4"></i>
          <h2 class="text-xl font-semibold text-geo-dark mb-2">Mapa Interactivo</h2>
          <p class="text-gray-600">Cuenca del Río Canoabo, Estado Carabobo</p>
        </div>
      </div>
    </div>

    <!-- Controles del mapa -->
    <div class="absolute top-4 right-4 space-y-2 z-10">
      <div class="bg-white rounded-lg shadow-lg">
        <button class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <i class="fas fa-plus text-gray-600 text-sm"></i>
        </button>
        <div class="border-t border-gray-200"></div>
        <button class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <i class="fas fa-minus text-gray-600 text-sm"></i>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-lg">
        <button class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <i class="fas fa-home text-gray-600 text-sm"></i>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-lg">
        <button class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <i class="fas fa-expand text-gray-600 text-sm"></i>
        </button>
      </div>
    </div>    <!-- Información de escala -->
    <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-md shadow px-2 py-1 z-10">
      <div class="flex items-center space-x-2">
        <i class="fas fa-ruler text-gray-600 text-xs"></i>
        <span class="text-xs text-gray-700">Escala {{ scale }}</span>
      </div>
    </div>

    <!-- Información de coordenadas -->
    <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-md shadow px-2 py-1 z-10">
      <div class="flex items-center space-x-2">
        <i class="fas fa-crosshairs text-gray-600 text-xs"></i>
        <span class="text-xs text-gray-700">{{ mapCoordinates }}</span>
      </div>
    </div>
  </div>
</template>
