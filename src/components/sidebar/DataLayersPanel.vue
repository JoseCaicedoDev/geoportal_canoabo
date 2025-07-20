<template>
  <section class="border border-geo-border rounded-lg" role="region" aria-labelledby="data-layers-heading">
    <header
      class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
      @click="toggleAccordion"
      role="button"
      :aria-expanded="isOpen"
      aria-controls="data-layers-content"
    >
      <div class="flex items-center space-x-3">
        <div class="w-4 h-4 bg-green-600 dark:bg-green-400 rounded" aria-hidden="true"></div>
        <h3 id="data-layers-heading" class="text-sm font-medium text-gray-900 dark:text-white">Capas</h3>
      </div>
      <div class="flex items-center space-x-2">
        <i
          :class="[
            'fas fa-chevron-down text-gray-600 dark:text-gray-300 transform transition-transform',
            isOpen ? 'rotate-180' : ''
          ]"
          aria-hidden="true"
        ></i>
      </div>
    </header>

    <div
      v-show="isOpen"
      id="data-layers-content"
      class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800"
    >
      <!-- Layer list -->
      <div class="space-y-3" role="list" aria-label="Lista de capas de datos">
        <LayerItem
          v-for="layerId in allWfsLayers"
          :key="layerId"
          :layer-id="layerId"
          :display-name="getLayerDisplayName(layerId)"
          :is-selected="selectedLayers.has(layerId)"
          :layer-group="getLayerGroup(layerId)"
          :geometry-type="getLayerGeometryType(layerId)"
          @layer-toggle="$emit('layer-toggle', $event)"
          @context-menu="$emit('context-menu', $event, layerId)"
          role="listitem"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import LayerItem from './LayerItem.vue'

const props = defineProps({
  wfsLayerGroups: {
    type: Object,
    required: true,
    default: () => ({})
  },
  wfsLayers: {
    type: Object,
    required: true,
    default: () => ({})
  },
  selectedLayers: {
    type: Set,
    required: true
  },
  layerService: {
    type: Object,
    required: true
  },
  initiallyOpen: {
    type: Boolean,
    default: true
  }
})

defineEmits(['layer-toggle', 'context-menu'])

const isOpen = ref(props.initiallyOpen)

const toggleAccordion = () => {
  isOpen.value = !isOpen.value
}

// Computed properties
const allWfsLayers = computed(() => {
  const allLayers = []
  Object.values(props.wfsLayerGroups).forEach(group => {
    allLayers.push(...group.layers)
  })
  return allLayers
})

// Helper methods
const getLayerDisplayName = (layerId) => {
  return props.wfsLayers[layerId] || layerId
}

const getLayerGroup = (layerId) => {
  return Object.values(props.wfsLayerGroups).find(group =>
    group.layers.includes(layerId)
  )
}

const getLayerGeometryType = (layerId) => {
  return props.layerService.getLayerGeometryType(layerId)
}
</script>
