<template>
  <div
    ref="mapContainer"
    class="absolute inset-0 bg-geo-background z-0"
    role="application"
    :aria-label="mapAriaLabel"
    @mousemove="handleMouseMove"
  >
    <!-- Slot para contenido adicional del mapa -->
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  mapAriaLabel: {
    type: String,
    default: 'Mapa interactivo geográfico'
  },
  center: {
    type: Array,
    default: () => [10.3316, -68.2833]
  },
  zoom: {
    type: Number,
    default: 12
  }
})

const emit = defineEmits(['mouse-move', 'map-ready'])

const mapContainer = ref(null)

const handleMouseMove = (event) => {
  emit('mouse-move', event)
}

onMounted(() => {
  // Emitir evento cuando el contenedor esté listo
  emit('map-ready', mapContainer.value)
})

// Exponer la referencia del contenedor para uso externo
defineExpose({
  mapContainer
})
</script>
