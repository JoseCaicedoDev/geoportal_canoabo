<template>
  <div
    v-if="show"
    class="fixed bg-geo-background border border-geo-border rounded-lg shadow-lg py-2 z-50 w-48"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <div
      v-for="item in menuItems"
      :key="item.text"
      class="px-4 py-2 hover:bg-geo-hover cursor-pointer text-sm flex items-center space-x-2 text-geo-text hover:text-geo-primary transition-colors"
      @click="item.action"
    >
      <i :class="[item.icon, 'text-geo-text/60']"></i>
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLayerStore } from '@/stores/layerStore'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  layerId: {
    type: String,
    required: true
  },
  position: {
    type: Object,
    required: true,
    default: () => ({ x: 0, y: 0 })
  }
})

const store = useLayerStore()

const menuItems = computed(() => [
  {
    icon: 'fas fa-eye',
    text: 'Ver detalles',
    action: () => {
      store.showLayerDetails(props.layerId)
      store.hideContextMenu()
    }
  },
  {
    icon: 'fas fa-table',
    text: 'Ver atributos',
    action: () => {
      store.showAttributeTable(props.layerId)
      store.hideContextMenu()
    }
  }
])
</script>
