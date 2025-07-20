<template>
  <div
    v-if="isVisible"
    class="mt-2"
    role="img"
    aria-label="Leyenda de texturas de suelo"
  >
    <div class="space-y-1">
      <div
        v-for="textura in texturaColors"
        :key="textura.textura"
        class="flex items-center space-x-2"
      >
        <div
          class="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
          :style="{ backgroundColor: textura.color }"
          :aria-label="`Color ${textura.name}`"
        ></div>
        <span class="text-xs text-gray-700 dark:text-gray-300">{{ textura.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  }
})

const texturaColors = [
  { textura: 'a', color: '#2d2139', name: 'Arenoso' },
  { textura: 'aF', color: '#7fa7c5', name: 'Areno Franco' },
  { textura: 'F', color: '#3ecfc6', name: 'Franco' },
  { textura: 'Fa', color: '#8eea70', name: 'Franco Arenoso' },
  { textura: 'FA', color: '#c2e96a', name: 'Franco Arcilloso' },
  { textura: 'FL', color: '#e3a23c', name: 'Franco Limoso' },
  { textura: 'L', color: '#a34b0e', name: 'Limoso' },
  { textura: 'A', color: '#e78a9b', name: 'Arcilloso' }
]
</script>
