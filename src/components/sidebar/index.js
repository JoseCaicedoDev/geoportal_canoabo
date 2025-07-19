// Barrel export para microcomponentes de sidebar
export { default as SidebarTabs } from './SidebarTabs.vue'
export { default as BaseLayerSelector } from './BaseLayerSelector.vue'
export { default as DataLayersPanel } from './DataLayersPanel.vue'
export { default as LayerItem } from './LayerItem.vue'
export { default as TextureLegend } from './TextureLegend.vue'
export { default as SidebarFooter } from './SidebarFooter.vue'

// Re-export del composable relacionado para mantener cohesión del módulo
export { useAccordion } from '@/composables/useAccordion'
