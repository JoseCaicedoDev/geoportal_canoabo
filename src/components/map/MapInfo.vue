<template>
  <footer class="absolute bottom-4 left-0 right-0 flex justify-between items-end px-4 z-10">
    <!-- Scale Information -->
    <div
      class="bg-green-600 backdrop-blur-sm rounded-md shadow-lg border border-green-700 px-3 py-2"
      role="status"
      aria-label="Información de escala del mapa"
    >
      <div class="flex items-center space-x-2">
        <i class="fas fa-ruler text-white text-xs" aria-hidden="true"></i>
        <span class="text-xs text-white font-medium">Escala {{ scale }}</span>
      </div>
    </div>

    <!-- Coordinates Information -->
    <div
      class="bg-green-600 backdrop-blur-sm rounded-md shadow-lg border border-green-700 px-3 py-2"
      role="status"
      aria-label="Coordenadas del cursor"
      aria-live="polite"
    >
      <div class="flex items-center space-x-2">
        <i class="fas fa-crosshairs text-white text-xs" aria-hidden="true"></i>
        <span class="text-xs text-white font-medium">{{ coordinates }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const props = defineProps({
  scale: {
    type: String,
    required: true,
    default: '1:140,000'
  },
  coordinates: {
    type: String,
    required: true,
    default: 'Mueve el cursor sobre el mapa'
  }
})
</script>
