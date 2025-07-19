<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="layer-details-title"
    @click="closeModal"
  >
    <div
      class="bg-geo-background rounded-lg shadow-xl w-full max-w-md mx-4"
      @click.stop
      role="document"
    >
      <!-- Header -->
      <header class="flex items-center justify-between p-6 border-b border-geo-border">
        <h2
          id="layer-details-title"
          class="text-xl font-semibold text-geo-text"
        >
          Detalles de la Capa
        </h2>
        <button
          @click="closeModal"
          class="p-1 text-geo-text/60 hover:text-geo-text transition-colors rounded-md hover:bg-geo-hover"
          type="button"
          aria-label="Cerrar modal de detalles"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </header>

      <!-- Content -->
      <main class="p-6">
        <!-- Layer Name -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-geo-text mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2 text-geo-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            {{ layerName }}
          </h3>
          <p class="text-sm text-geo-text/60">
            ID: {{ layerId }}
          </p>
        </div>

        <!-- Under Construction Message -->
        <div class="text-center py-8">
          <div class="mb-4">
            <svg
              class="w-16 h-16 mx-auto text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>

          <h4 class="text-lg font-medium text-geo-text mb-2">
            Sección en Construcción
          </h4>

          <p class="text-geo-text/60 mb-4">
            Los detalles completos de la capa estarán disponibles próximamente.
          </p>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="text-left">
                <p class="text-sm font-medium text-yellow-800">
                  Funcionalidad en desarrollo
                </p>
                <p class="text-sm text-yellow-700 mt-1">
                  Esta función incluirá información detallada sobre geometría, metadatos, estadísticas y configuración de la capa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="flex justify-end p-6 border-t border-geo-border bg-geo-hover/30">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-geo-primary text-white rounded-md hover:bg-geo-primary/90 transition-colors focus:ring-2 focus:ring-geo-primary focus:ring-offset-2"
          type="button"
        >
          Cerrar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  layerId: {
    type: String,
    default: ''
  },
  layerName: {
    type: String,
    default: 'Capa sin nombre'
  },
  layerDetails: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}

// Keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Add keyboard event listener when component mounts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
