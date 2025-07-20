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
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
          <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">{{ t('modal.loading') }}</span>
        </div>

        <!-- Layer Information List -->
        <div v-else class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">

          <!-- Nombre de la capa -->
          <div class="px-4 py-3 flex justify-between items-center">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('modal.layerInfo.name') }}
            </dt>
            <dd class="text-sm text-gray-900 dark:text-white font-medium">
              {{ layerDetails.name || t('modal.layerInfo.noData') }}
            </dd>
          </div>

          <!-- Tipo de Geometría -->
          <div class="px-4 py-3 flex justify-between items-center">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('modal.layerInfo.geometryType') }}
            </dt>
            <dd class="text-sm text-gray-900 dark:text-white">
              {{ getGeometryTypeLabel(layerDetails.geometryType) }}
            </dd>
          </div>

          <!-- Cantidad de registros -->
          <div class="px-4 py-3 flex justify-between items-center">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('modal.layerInfo.recordCount') }}
            </dt>
            <dd class="text-sm text-gray-900 dark:text-white">
              {{ formatRecordCount(layerDetails.recordCount) }}
            </dd>
          </div>

          <!-- Tipo de servicio -->
          <div class="px-4 py-3 flex justify-between items-center">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('modal.layerInfo.serviceType') }}
            </dt>
            <dd class="text-sm text-gray-900 dark:text-white uppercase">
              {{ layerDetails.serviceType || t('modal.layerInfo.noData') }}
            </dd>
          </div>

          <!-- Variables -->
          <div class="px-4 py-3">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {{ t('modal.layerInfo.variables') }}
            </dt>
            <dd v-if="layerDetails.variables && layerDetails.variables.length > 0" class="max-h-32 overflow-y-auto">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="variable in layerDetails.variables"
                  :key="variable"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                >
                  {{ variable }}
                </span>
              </div>
            </dd>
            <dd v-else class="text-sm text-gray-900 dark:text-white">
              {{ t('modal.layerInfo.noData') }}
            </dd>
          </div>

          <!-- Sistema de referencia -->
          <div class="px-4 py-3 flex justify-between items-center">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('modal.layerInfo.referenceSystem') }}
            </dt>
            <dd class="text-sm text-gray-900 dark:text-white">
              {{ layerDetails.referenceSystem || t('modal.layerInfo.noData') }}
            </dd>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { layerService } from '../services/layerService.js'

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
  }
})

// Estado reactivo para los datos de la capa
const layerDetails = ref({
  name: '',
  displayName: '',
  geometryType: '',
  recordCount: 0,
  serviceType: '',
  variables: [],
  referenceSystem: ''
})
const isLoading = ref(false)

// Computed para el nombre de la capa con fallback traducido (para el título)
const displayLayerName = computed(() => {
  return layerDetails.value.displayName || props.layerName || t('modal.layerName')
})

// Función para cargar los datos de la capa
const loadLayerDetails = async () => {
  if (!props.layerId) return

  isLoading.value = true
  try {
    const details = await layerService.getLayerDetails(props.layerId)
    layerDetails.value = details
  } catch (error) {
    console.error('Error loading layer details:', error)
    // Mantener valores por defecto en caso de error
  } finally {
    isLoading.value = false
  }
}

// Observar cambios en layerId para recargar datos
watch(() => props.layerId, () => {
  if (props.show && props.layerId) {
    loadLayerDetails()
  }
}, { immediate: true })

// Cargar datos cuando se muestra el modal
watch(() => props.show, (newShow) => {
  if (newShow && props.layerId) {
    loadLayerDetails()
  }
})

// Función para traducir tipos de geometría
const getGeometryTypeLabel = (geometryType) => {
  if (!geometryType) return t('modal.layerInfo.noData')

  const translationKey = `modal.geometryTypes.${geometryType}`
  return t(translationKey, geometryType) // Fallback al valor original si no existe traducción
}

// Función para formatear cantidad de registros
const formatRecordCount = (count) => {
  if (count === null || count === undefined) return t('modal.layerInfo.noData')
  if (typeof count === 'number') {
    return count.toLocaleString('es-ES')
  }
  return count
}

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
