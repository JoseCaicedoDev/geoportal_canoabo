<template>
  <section class="border border-geo-border rounded-lg" role="region" aria-labelledby="base-layers-heading">
    <header
      class="flex items-center justify-between p-3 cursor-pointer hover:bg-geo-hover"
      @click="toggleAccordion"
      role="button"
      :aria-expanded="isOpen"
      aria-controls="base-layers-content"
    >
      <div class="flex items-center space-x-3">
        <div class="w-4 h-4 bg-geo-primary rounded" aria-hidden="true"></div>
        <h3 id="base-layers-heading" class="text-sm font-medium text-geo-text">Basemap</h3>
      </div>
      <i
        :class="[
          'fas fa-chevron-down text-geo-text/60 transform transition-transform',
          isOpen ? 'rotate-180' : ''
        ]"
        aria-hidden="true"
      ></i>
    </header>

    <div
      v-show="isOpen"
      id="base-layers-content"
      class="border-t border-geo-border p-3 space-y-2 bg-geo-hover/50"
      role="radiogroup"
      aria-labelledby="base-layers-heading"
    >
      <label
        v-for="(layer, layerId) in baseLayers"
        :key="layerId"
        class="flex items-center space-x-3 rounded-lg hover:bg-geo-hover cursor-pointer p-2 transition-colors"
      >
        <input
          type="radio"
          name="baseLayer"
          :value="layerId"
          :checked="selectedBaseLayer === layerId"
          @change="$emit('base-layer-change', layerId)"
          class="text-geo-primary focus:ring-geo-primary"
          :aria-describedby="`layer-${layerId}-desc`"
        >
        <span class="text-sm text-geo-text" :id="`layer-${layerId}-desc`">
          {{ layer.name }}
        </span>
      </label>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  baseLayers: {
    type: Object,
    required: true,
    default: () => ({})
  },
  selectedBaseLayer: {
    type: String,
    required: true
  },
  initiallyOpen: {
    type: Boolean,
    default: true
  }
})

defineEmits(['base-layer-change'])

const isOpen = ref(props.initiallyOpen)

const toggleAccordion = () => {
  isOpen.value = !isOpen.value
}

// Watcher para sincronizar con cambios externos
watch(() => props.selectedBaseLayer, (newValue) => {
  console.log('Base layer changed to:', newValue)
})
</script>
