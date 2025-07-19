// Barrel export para microcomponentes del mapa
export { default as MapContainer } from './MapContainer.vue'
export { default as MapControls } from './MapControls.vue'
export { default as MapInfo } from './MapInfo.vue'

// Re-export de composables relacionados para mantener cohesión del módulo
export { useMapEvents } from '@/composables/useMapEvents'
export { useMapControls } from '@/composables/useMapControls'
export { useMapLayers } from '@/composables/useMapLayers'
