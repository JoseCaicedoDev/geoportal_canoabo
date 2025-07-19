<template>
  <footer
    class="flex items-center justify-between p-4 bg-geo-background border-t border-geo-border"
    role="contentinfo"
    aria-label="Información del panel de atributos"
  >
    <!-- Statistics Summary -->
    <div class="flex items-center space-x-4 text-sm text-geo-text/60">
      <span aria-label="Estadísticas de datos">
        <strong>{{ totalRecords }}</strong> registro{{ totalRecords !== 1 ? 's' : '' }}
        {{ filteredRecords !== totalRecords ? `(${filteredRecords} filtrado${filteredRecords !== 1 ? 's' : ''})` : '' }}
      </span>

      <span
        v-if="selectedCount > 0"
        class="text-geo-primary font-medium"
        aria-label="Registros seleccionados"
      >
        {{ selectedCount }} seleccionado{{ selectedCount !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Action Buttons -->
    <div
      class="flex items-center space-x-2"
      role="group"
      aria-label="Acciones de datos"
    >
      <!-- Clear Selection -->
      <button
        v-if="selectedCount > 0"
        @click="$emit('clear-selection')"
        class="px-3 py-1 text-sm text-geo-text/70 hover:text-geo-text transition-colors"
        type="button"
        aria-label="Limpiar selección"
      >
        Limpiar selección
      </button>

      <!-- Export Selected -->
      <button
        v-if="selectedCount > 0"
        @click="$emit('export-selected')"
        :disabled="exporting"
        class="px-3 py-1 text-sm bg-geo-primary/10 text-geo-primary hover:bg-geo-primary/20 rounded-md border border-geo-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        type="button"
        :aria-label="exportSelectedAriaLabel"
      >
        {{ exporting ? 'Exportando...' : `Exportar selección (${selectedCount})` }}
      </button>

      <!-- Export All -->
      <button
        @click="$emit('export-all')"
        :disabled="exporting || filteredRecords === 0"
        class="px-3 py-1 text-sm bg-geo-secondary/10 text-geo-secondary hover:bg-geo-secondary/20 rounded-md border border-geo-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        type="button"
        :aria-label="exportAllAriaLabel"
      >
        {{ exporting ? 'Exportando...' : exportAllText }}
      </button>

      <!-- Refresh Data -->
      <button
        @click="$emit('refresh-data')"
        :disabled="refreshing"
        class="p-1 text-geo-text/60 hover:text-geo-text transition-colors"
        type="button"
        :aria-label="refreshAriaLabel"
        :title="refreshTitle"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': refreshing }"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Status Messages -->
    <div
      v-if="statusMessage"
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ statusMessage }}
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalRecords: {
    type: Number,
    required: true,
    validator: value => value >= 0
  },
  filteredRecords: {
    type: Number,
    required: true,
    validator: value => value >= 0
  },
  selectedCount: {
    type: Number,
    default: 0,
    validator: value => value >= 0
  },
  exporting: {
    type: Boolean,
    default: false
  },
  refreshing: {
    type: Boolean,
    default: false
  },
  lastRefresh: {
    type: Date,
    default: null
  },
  statusMessage: {
    type: String,
    default: ''
  }
})

defineEmits([
  'clear-selection',
  'export-selected',
  'export-all',
  'refresh-data'
])

// Computed properties
const exportSelectedAriaLabel = computed(() =>
  `Exportar ${props.selectedCount} registro${props.selectedCount !== 1 ? 's' : ''} seleccionado${props.selectedCount !== 1 ? 's' : ''}`
)

const exportAllAriaLabel = computed(() => {
  const count = props.filteredRecords
  return `Exportar todos los ${count} registro${count !== 1 ? 's' : ''}${props.filteredRecords !== props.totalRecords ? ' filtrados' : ''}`
})

const exportAllText = computed(() => {
  const count = props.filteredRecords
  if (props.filteredRecords !== props.totalRecords) {
    return `Exportar filtrados (${count})`
  }
  return `Exportar todo (${count})`
})

const refreshAriaLabel = computed(() =>
  props.refreshing ? 'Actualizando datos...' : 'Actualizar datos'
)

const refreshTitle = computed(() => {
  if (props.refreshing) return 'Actualizando datos...'
  if (props.lastRefresh) {
    return `Última actualización: ${props.lastRefresh.toLocaleTimeString('es-ES')}`
  }
  return 'Actualizar datos'
})
</script>
