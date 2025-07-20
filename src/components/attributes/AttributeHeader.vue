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
      {{ defaultTitle }}
      <span
        v-if="layerDisplayName"
        class="ml-2 text-sm text-geo-text/60 font-normal"
        :aria-label="`Capa activa: ${layerDisplayName}`"
      >
        <span
          v-if="totalCount !== undefined"
          class="ml-2 text-geo-text/80 font-medium"
        >
          {{ $t('attributes.total') }}: {{ totalCount }}
          <span v-if="filteredCount !== undefined">, {{ $t('attributes.filtered') }}: {{ filteredCount }}</span>
          <span v-if="selectedCount !== undefined && selectedCount > 0">, {{ $t('attributes.selected') }}: {{ selectedCount }}</span>
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
        :aria-label="defaultExportAriaLabel"
        :disabled="isExportDisabled"
        type="button"
      >
        <i class="fas fa-download mr-1" aria-hidden="true"></i>
        {{ defaultExportText }}
      </button>

      <button
        @click="$emit('close-panel')"
        class="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        :aria-label="defaultCloseAriaLabel"
        type="button"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  layerDisplayName: {
    type: String,
    default: ''
  },
  totalCount: {
    type: Number,
    default: undefined
  },
  filteredCount: {
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
    default: ''
  },
  exportAriaLabel: {
    type: String,
    default: ''
  },
  closeAriaLabel: {
    type: String,
    default: ''
  }
})

// Computed values for default translations
const defaultTitle = computed(() => props.title || t('attributes.title'))
const defaultExportText = computed(() => props.exportButtonText || t('attributes.export'))
const defaultExportAriaLabel = computed(() => props.exportAriaLabel || t('attributes.exportAll', { count: 0 }))
const defaultCloseAriaLabel = computed(() => props.closeAriaLabel || t('attributes.close'))

defineEmits(['export-attributes', 'close-panel'])
</script>
