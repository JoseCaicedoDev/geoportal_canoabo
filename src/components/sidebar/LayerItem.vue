<template>
  <article
    class="relative group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
    role="article"
    :aria-labelledby="`layer-${layerId}-title`"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-start space-x-3 flex-1">
        <input
          type="checkbox"
          :class="layerColorClass"
          :checked="isSelected"
          @change="$emit('layer-toggle', layerId)"
          class="mt-0.5"
          :aria-describedby="`layer-${layerId}-desc`"
        >
        <div class="flex flex-col">
          <h4
            :id="`layer-${layerId}-title`"
            class="text-sm font-medium text-gray-900 dark:text-white"
          >
            {{ displayName }}
          </h4>

          <!-- Geometry icon for non-soil layers -->
          <div v-if="!isSoilLayer && isSelected" class="mt-1">
            <i
              :class="[geometryIcon, iconColor, 'text-xs']"
              :aria-label="`Tipo de geometría: ${geometryType}`"
            ></i>
          </div>

          <!-- Texture legend for soil layers -->
          <TextureLegend
            v-if="isSoilLayer && isSelected"
            :is-visible="true"
          />
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Context menu button -->
        <button
          class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
          @click="$emit('context-menu', $event, layerId)"
          :aria-label="`Opciones para capa ${displayName}`"
          aria-haspopup="true"
        >
          <i class="fas fa-ellipsis-v text-xs" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import TextureLegend from './TextureLegend.vue'

const props = defineProps({
  layerId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    required: true
  },
  layerGroup: {
    type: Object,
    default: null
  },
  geometryType: {
    type: String,
    default: 'Point'
  }
})

defineEmits(['layer-toggle', 'context-menu'])

// Computed properties
const isSoilLayer = computed(() => props.layerId === 'suelos-wfs')

const layerColorClass = computed(() => {
  const group = props.layerGroup
  if (group) {
    switch (group.color) {
      case 'blue-500':
        return 'text-blue-500 dark:text-blue-400 focus:ring-blue-500'
      case 'amber-500':
        return 'text-amber-500 dark:text-amber-400 focus:ring-amber-500'
      case 'red-600':
        return 'text-red-600 dark:text-red-500 focus:ring-red-500'
      default:
        return 'text-green-600 dark:text-green-400 focus:ring-green-500'
    }
  }
  return 'text-green-600 dark:text-green-400 focus:ring-green-500'
})

const geometryIcon = computed(() => {
  switch (props.geometryType) {
    case 'Point':
      return 'fas fa-circle'
    case 'LineString':
      return 'fas fa-minus'
    case 'Polygon':
      return 'fas fa-square'
    default:
      return 'fas fa-circle'
  }
})

const iconColor = computed(() => {
  const group = props.layerGroup

  // Special case for soil layers
  if (isSoilLayer.value) {
    return 'text-amber-600 dark:text-amber-400'
  }

  switch (group?.color) {
    case 'blue-500':
      return 'text-blue-500 dark:text-blue-400'
    case 'amber-500':
      return 'text-amber-500 dark:text-amber-400'
    case 'red-600':
      return 'text-red-600 dark:text-red-500'
    default:
      return 'text-green-600 dark:text-green-400'
  }
})
</script>
