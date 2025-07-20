<template>
  <footer class="absolute bottom-4 left-0 right-0 flex justify-between items-end px-4 z-10">
    <!-- Scale Information -->
    <div
      class="bg-green-600 backdrop-blur-sm rounded-md shadow-lg border border-green-700 px-3 py-2"
      role="status"
      :aria-label="t('map.scaleInfo')"
    >
      <div class="flex items-center space-x-2">
        <i class="fas fa-ruler text-white text-xs" aria-hidden="true"></i>
        <span class="text-xs text-white font-medium">{{ t('map.scale') }} {{ scale }}</span>
      </div>
    </div>

    <!-- Coordinates Information -->
    <div
      class="bg-green-600 backdrop-blur-sm rounded-md shadow-lg border border-green-700 px-3 py-2"
      role="status"
      :aria-label="t('map.coordinatesInfo')"
      aria-live="polite"
    >
      <div class="flex items-center space-x-2">
        <i class="fas fa-crosshairs text-white text-xs" aria-hidden="true"></i>
        <span class="text-xs text-white font-medium">{{ displayCoordinates }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  scale: {
    type: String,
    required: true,
    default: '1:140,000'
  },
  coordinates: {
    type: String,
    required: true,
    default: ''
  }
})

// Computed property para mostrar coordenadas con texto por defecto traducido
const displayCoordinates = computed(() => {
  return props.coordinates || t('map.moveCursorPrompt')
})
</script>
