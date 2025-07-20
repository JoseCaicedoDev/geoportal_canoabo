<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ t('sidebar.analysis.organicMatter.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('sidebar.analysis.organicMatter.description') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
      <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">
        {{ t('sidebar.analysis.organicMatter.loading') }}
      </span>
    </div>

    <!-- Chart Container -->
    <div v-else-if="chartData" class="relative">
      <canvas ref="chartCanvas" class="max-h-96"></canvas>

      <!-- Summary -->
      <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {{ totalSamples }} {{ t('sidebar.analysis.organicMatter.samples') }}
      </div>

      <!-- Statistics Table -->
      <div class="mt-6 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">
                {{ t('sidebar.analysis.organicMatter.xAxisLabel') }}
              </th>
              <th class="text-right py-2 px-3 font-medium text-gray-900 dark:text-white">
                {{ t('sidebar.analysis.organicMatter.averageLabel') }} (%)
              </th>
              <th class="text-right py-2 px-3 font-medium text-gray-900 dark:text-white">
                Min (%)
              </th>
              <th class="text-right py-2 px-3 font-medium text-gray-900 dark:text-white">
                Max (%)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(stat, horizon) in statistics" :key="horizon" class="border-b border-gray-100 dark:border-gray-700">
              <td class="py-2 px-3 text-gray-900 dark:text-white">
                {{ t(`sidebar.analysis.organicMatter.horizons.${horizon}`) }}
              </td>
              <td class="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                {{ stat.average.toFixed(2) }}
              </td>
              <td class="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                {{ stat.min.toFixed(2) }}
              </td>
              <td class="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                {{ stat.max.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-8">
      <div class="text-gray-500 dark:text-gray-400">
        {{ t('sidebar.analysis.organicMatter.noData') }}
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

  const horizons = ['h1_mo', 'h2_mo', 'h3_mo', 'h4_mo']
  const labels = horizons.map(h => t(`sidebar.analysis.organicMatter.horizons.${h.split('_')[0]}`))

  // Calcular promedios por horizonte
  const averages = horizons.map(horizon => {
    const values = soilData.value
      .map(sample => parseFloat(sample[horizon]))
      .filter(val => !isNaN(val) && val > 0)

    return values.length > 0
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0
  })

  return {
    labels,
    datasets: [{
      label: t('sidebar.analysis.organicMatter.averageLabel'),
      data: averages,
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }]
  }
})

const statistics = computed(() => {
  if (!soilData.value.length) return {}

  const horizons = ['h1_mo', 'h2_mo', 'h3_mo', 'h4_mo']
  const stats = {}

  horizons.forEach(horizon => {
    const values = soilData.value
      .map(sample => parseFloat(sample[horizon]))
      .filter(val => !isNaN(val) && val > 0)

    if (values.length > 0) {
      const key = horizon.split('_')[0] // h1, h2, h3, h4
      stats[key] = {
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      }
    }
  })

  return stats
})

const totalSamples = computed(() => soilData.value.length)

// Methods
const loadSoilData = async () => {
  isLoading.value = true
  try {
    const data = await layerService.getWFSData('suelos-wfs')
    // Filtrar muestras que tengan al menos un horizonte con datos de materia orgánica
    soilData.value = data.filter(sample =>
      sample.h1_mo || sample.h2_mo || sample.h3_mo || sample.h4_mo
    )
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
  const isDark = document.documentElement.classList.contains('dark')

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: t('sidebar.analysis.organicMatter.yAxisLabel'),
            color: isDark ? '#D1D5DB' : '#374151'
          },
          ticks: {
            color: isDark ? '#D1D5DB' : '#374151'
          },
          grid: {
            color: isDark ? '#374151' : '#E5E7EB'
          }
        },
        x: {
          title: {
            display: true,
            text: t('sidebar.analysis.organicMatter.xAxisLabel'),
            color: isDark ? '#D1D5DB' : '#374151'
          },
          ticks: {
            color: isDark ? '#D1D5DB' : '#374151'
          },
          grid: {
            color: isDark ? '#374151' : '#E5E7EB'
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
