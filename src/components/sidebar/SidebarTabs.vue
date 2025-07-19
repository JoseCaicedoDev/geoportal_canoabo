<template>
  <nav
    class="flex border-b border-geo-border"
    role="tablist"
    aria-label="Navegación del panel lateral"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="[
        'flex-1 py-2 px-3 text-sm font-medium transition-colors',
        activeTab === tab.id
          ? 'text-geo-primary border-b-2 border-geo-primary bg-geo-hover/50'
          : 'text-geo-text/60 hover:text-geo-primary'
      ]"
      :aria-selected="activeTab === tab.id"
      role="tab"
      @click="$emit('tab-change', tab.id)"
    >
      <i :class="[tab.icon, 'mr-1']" aria-hidden="true"></i>
      {{ tab.label }}
    </button>
  </nav>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true,
    default: () => [
      { id: 'layers', label: 'Capas', icon: 'fas fa-layer-group' },
      { id: 'analysis', label: 'Análisis', icon: 'fas fa-chart-bar' },
      { id: 'info', label: 'Info', icon: 'fas fa-info-circle' }
    ]
  }
})

defineEmits(['tab-change'])
</script>
