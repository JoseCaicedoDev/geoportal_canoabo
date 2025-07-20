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
        <div class="w-4 h-4 bg-geo-secondary dark:bg-geo-secondary rounded" aria-hidden="true"></div>
        <h3 id="base-layers-heading" class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('layers.baseMap') }}</h3>
      </div>
      <i
        :class="[
          'fas fa-chevron-down text-gray-600 dark:text-gray-300 transform transition-transform',
          isOpen ? 'rotate-180' : ''
        ]"
        aria-hidden="true"
      ></i>
    </header>

    <div
      v-show="isOpen"
      id="base-layers-content"
      class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50 dark:bg-gray-800"
      role="radiogroup"
      aria-labelledby="base-layers-heading"
    >
      <label
        v-for="(layer, layerId) in baseLayers"
        :key="layerId"
        class="flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer p-2 transition-colors"
      >
        <input
          type="radio"
          name="baseLayer"
          :value="layerId"
          :checked="selectedBaseLayer === layerId"
          @change="$emit('base-layer-change', layerId)"
          class="text-green-600 dark:text-green-400 focus:ring-green-500"
          :aria-describedby="`layer-${layerId}-desc`"
        >
        <span class="text-sm text-gray-700 dark:text-gray-300" :id="`layer-${layerId}-desc`">
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
    default: false
  }
})

defineEmits(['base-layer-change'])

const isOpen = ref(props.initiallyOpen)

const toggleAccordion = () => {
  isOpen.value = !isOpen.value
}
</script>
