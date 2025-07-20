<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ t('sidebar.analysis.soilTexture.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('sidebar.analysis.soilTexture.description') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
      <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">
        {{ t('sidebar.analysis.soilTexture.loading') }}
      </span>
    </div>

    <!-- Chart Container -->
    <div v-else-if="chartData" class="relative">
      <canvas ref="chartCanvas" class="max-h-96"></canvas>

      <!-- Summary -->
      <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {{ totalSamples }} {{ t('sidebar.analysis.soilTexture.samples') }}
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-8">
      <div class="text-gray-500 dark:text-gray-400">
        {{ t('sidebar.analysis.soilTexture.noData') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart, registerables } from 'chart.js'
import { layerService } from '@/services/layerService'

// Registrar todos los componentes de Chart.js
Chart.register(...registerables)

const { t } = useI18n()
const chartCanvas = ref(null)
const chartInstance = ref(null)
const isLoading = ref(false)
const soilData = ref([])

// Computed properties
const chartData = computed(() => {
  if (!soilData.value.length) return null

  // Contar texturas
  const textureCount = {}
  soilData.value.forEach(sample => {
    const texture = sample.h1_text || 'Sin clasificar'
    textureCount[texture] = (textureCount[texture] || 0) + 1
  })

  return {
    labels: Object.keys(textureCount),
    datasets: [{
      data: Object.values(textureCount),
      backgroundColor: [
        '#10B981', // Green
        '#3B82F6', // Blue
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Violet
        '#F97316', // Orange
        '#06B6D4', // Cyan
        '#84CC16', // Lime
        '#EC4899', // Pink
        '#6B7280'  // Gray
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  }
})

const totalSamples = computed(() => soilData.value.length)

// Methods
const loadSoilData = async () => {
  isLoading.value = true
  try {
    const data = await layerService.getWFSData('suelos-wfs')
    soilData.value = data.filter(sample => sample.h1_text) // Solo muestras con textura
  } catch (error) {
    console.error('Error loading soil data:', error)
    soilData.value = []
  } finally {
    isLoading.value = false
  }
}

const createChart = () => {
  if (!chartCanvas.value || !chartData.value) return

  // Destruir chart anterior si existe
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  chartInstance.value = new Chart(ctx, {
    type: 'pie',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#374151'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Lifecycle
onMounted(async () => {
  await loadSoilData()

  // Esperar al siguiente tick para asegurar que el canvas esté renderizado
  await new Promise(resolve => setTimeout(resolve, 100))
  createChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})

// Watchers para recrear chart cuando cambien los datos
import { watch } from 'vue'
watch(chartData, () => {
  if (chartData.value) {
    createChart()
  }
}, { deep: true })
</script>
