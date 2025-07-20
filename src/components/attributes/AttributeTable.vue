<template>
  <section
    class="bg-geo-background border border-geo-border rounded-lg h-full"
    role="region"
    aria-label="Tabla de atributos"
  >
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-8"
      role="status"
      aria-live="polite"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-geo-primary"></div>
      <span class="ml-3 text-geo-text">{{ $t('attributes.loading') }}</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!attributes.length"
      class="text-center py-8"
      role="status"
      aria-live="polite"
    >
      <p class="text-gray-600 dark:text-gray-400">{{ $t('attributes.noData') }}</p>
    </div>

    <!-- Data Table -->
    <div
      v-else
      class="h-full"
      role="table"
      aria-label="Datos de atributos"
    >
      <table class="w-full divide-y divide-geo-border" style="min-width: 1200px;">
        <!-- Table Header -->
        <thead
          class="bg-white dark:bg-gray-800 border-b border-geo-border sticky top-0 z-10"
          role="rowgroup"
          style="box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
        >
          <tr role="row">
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-r border-gray-200 dark:border-gray-600 last:border-r-0"
              style="min-width: 120px;"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': sortBy === column.key }"
              @click="$emit('sort', column.key)"
              :aria-sort="getSortDirection(column.key)"
              role="columnheader"
              tabindex="0"
              @keydown.enter="$emit('sort', column.key)"
              @keydown.space.prevent="$emit('sort', column.key)"
            >
              <div class="flex items-center">
                <span>{{ column.label }}</span>
                <span
                  v-if="sortBy === column.key"
                  class="ml-1"
                  :aria-label="sortOrder === 'asc' ? 'Ordenado ascendente' : 'Ordenado descendente'"
                >
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody
          class="bg-geo-background divide-y divide-geo-border"
          role="rowgroup"
        >
          <tr
            v-for="(row, index) in paginatedData"
            :key="getRowKey(row, index)"
            class="hover:bg-geo-primary/5 transition-colors cursor-pointer select-none"
            role="row"
            :class="{
              'bg-geo-primary/20 text-geo-primary font-medium': selectedRowIndex === index,
              'hover:bg-geo-primary/10': selectedRowIndex !== index
            }"
            @click="$emit('row-select', row, index)"
            tabindex="0"
            @keydown.enter="$emit('row-select', row, index)"
            @keydown.space.prevent="$emit('row-select', row, index)"
            :aria-selected="selectedRowIndex === index"
            :title="selectedRowIndex === index ? 'Fila seleccionada - clic para deseleccionar' : 'Clic para seleccionar fila y elemento en el mapa'"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 whitespace-nowrap text-sm"
              style="min-width: 120px;"
              role="gridcell"
              :data-label="column.label"
              :class="selectedRowIndex === index ? 'text-geo-primary font-medium' : 'text-geo-text'"
            >
              <span
                v-if="column.type === 'texture'"
                class="inline-flex items-center"
              >
                <span
                  class="w-4 h-4 rounded-full mr-2 border border-gray-300"
                  :style="{ backgroundColor: getTextureColor(row[column.key]) }"
                  :aria-label="`Color para textura ${row[column.key]}`"
                ></span>
                {{ formatCellValue(row[column.key], column) }}
              </span>

              <span v-else>
                {{ formatCellValue(row[column.key], column) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Summary -->
    <div
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      Tabla con {{ filteredData.length }} filas y {{ columns.length }} columnas.
      {{ selectedRowIndex !== null ? `Fila ${selectedRowIndex + 1} seleccionada.` : '' }}
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  attributes: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchTerm: {
    type: String,
    default: ''
  },
  sortBy: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc',
    validator: value => ['asc', 'desc'].includes(value)
  },
  currentPage: {
    type: Number,
    default: 1
  },
  recordsPerPage: {
    type: Number,
    default: 10
  },
  selectedRowIndex: {
    type: Number,
    default: null
  },
  loadingText: {
    type: String,
    default: 'Cargando atributos...'
  },
  emptyText: {
    type: String,
    default: 'No se encontraron atributos'
  },
  textureColors: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['sort', 'row-select'])

// Computed properties
const filteredData = computed(() => {
  if (!props.searchTerm) return props.attributes

  const searchLower = props.searchTerm.toLowerCase()
  return props.attributes.filter(row =>
    props.columns.some(column =>
      String(row[column.key] || '').toLowerCase().includes(searchLower)
    )
  )
})

const sortedData = computed(() => {
  if (!props.sortBy) return filteredData.value

  return [...filteredData.value].sort((a, b) => {
    const aValue = a[props.sortBy]
    const bValue = b[props.sortBy]

    if (aValue === bValue) return 0

    const comparison = aValue < bValue ? -1 : 1
    return props.sortOrder === 'asc' ? comparison : -comparison
  })
})

const paginatedData = computed(() => {
  const start = (props.currentPage - 1) * props.recordsPerPage
  const end = start + props.recordsPerPage
  return sortedData.value.slice(start, end)
})

// Methods
const getSortDirection = (columnKey) => {
  if (props.sortBy !== columnKey) return 'none'
  return props.sortOrder === 'asc' ? 'ascending' : 'descending'
}

const getRowKey = (row, index) => {
  // Try to use a unique identifier if available, otherwise use index
  return row.id || row.fid || `row-${index}`
}

const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return '-'

  if (column.type === 'number') {
    return Number(value).toLocaleString('es-ES', {
      maximumFractionDigits: 2
    })
  }

  if (column.type === 'date') {
    return new Date(value).toLocaleDateString('es-ES')
  }

  return String(value)
}

const getTextureColor = (texture) => {
  return props.textureColors[texture] || '#cccccc'
}
</script>

<style scoped>
/* Responsive table styling */
@media (max-width: 640px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }

  thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  tr {
    border: 1px solid #ccc;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 8px;
    background-color: var(--geo-background);
  }

  td {
    border: none;
    position: relative;
    padding-left: 50% !important;
  }

  td:before {
    content: attr(data-label) ": ";
    position: absolute;
    left: 6px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
    font-weight: 600;
    color: var(--geo-text);
  }
}
</style>
