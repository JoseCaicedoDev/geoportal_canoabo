<template>
  <header
    class="flex items-center justify-between p-4 border-b border-geo-border bg-geo-hover/50"
    role="banner"
    aria-labelledby="attribute-panel-title"
  >
    <h1
      id="attribute-panel-title"
      class="font-semibold text-geo-text flex items-center"
    >
      <i class="fas fa-table mr-2 text-geo-accent" aria-hidden="true"></i>
      {{ title }}
      <span
        v-if="layerDisplayName"
        class="ml-2 text-sm text-geo-text/60 font-normal"
        :aria-label="`Capa activa: ${layerDisplayName}`"
      >
        <span
          v-if="totalCount !== undefined"
          class="ml-2 text-geo-text/80 font-medium"
        >
        Total: {{ totalCount }}{{ selectedCount !== undefined && selectedCount > 0 ? `, Seleccionado: ${selectedCount}` : '' }}
        </span>
      </span>
    </h1>

    <nav
      class="flex items-center space-x-2"
      role="navigation"
      aria-label="Acciones del panel de atributos"
    >
      <button
        @click="$emit('export-attributes')"
        class="px-3 py-1 text-xs bg-geo-secondary text-white rounded-md hover:bg-blue-600 transition-colors"
        :aria-label="exportAriaLabel"
        :disabled="isExportDisabled"
        type="button"
      >
        <i class="fas fa-download mr-1" aria-hidden="true"></i>
        {{ exportButtonText }}
      </button>

      <button
        @click="$emit('close-panel')"
        class="p-1 text-geo-text/60 hover:text-geo-text transition-colors"
        :aria-label="closeAriaLabel"
        type="button"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </nav>
  </header>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Tabla de Atributos'
  },
  layerDisplayName: {
    type: String,
    default: ''
  },
  totalCount: {
    type: Number,
    default: undefined
  },
  selectedCount: {
    type: Number,
    default: undefined
  },
  isExportDisabled: {
    type: Boolean,
    default: false
  },
  exportButtonText: {
    type: String,
    default: 'Exportar'
  },
  exportAriaLabel: {
    type: String,
    default: 'Exportar datos de la tabla'
  },
  closeAriaLabel: {
    type: String,
    default: 'Cerrar panel de atributos'
  }
})

defineEmits(['export-attributes', 'close-panel'])
</script>
