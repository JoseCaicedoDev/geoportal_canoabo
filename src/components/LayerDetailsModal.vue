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
      class="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4"
      @click.stop
      role="document"
    >
      <!-- Header -->
      <header class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2
          id="layer-details-title"
          class="text-xl font-semibold text-gray-900 dark:text-white"
        >
          {{ $t('modal.layerDetails') }}
        </h2>
        <button
          @click="closeModal"
          class="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          type="button"
          :aria-label="$t('modal.closeModal')"
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
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            {{ displayLayerName }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
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

          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('modal.underConstruction') }}
          </h4>

          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ $t('modal.detailsAvailableSoon') }}
          </p>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="text-left">
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {{ $t('modal.functionalityInDevelopment') }}
                </p>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {{ $t('modal.featureDescription') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          type="button"
        >
          {{ $t('modal.close') }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
    default: ''
  },
  layerDetails: {
    type: Object,
    default: () => ({})
  }
})

// Computed para el nombre de la capa con fallback traducido
const displayLayerName = computed(() => {
  return props.layerName || t('modal.layerName')
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

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
