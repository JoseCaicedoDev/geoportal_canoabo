<template>
  <div>
    <section
      class="mb-3 flex items-center space-x-4"
      role="search"
      aria-label="Controles de filtrado y visualización"
    >
      <!-- Search Input -->
      <div class="flex-1">
        <label for="attribute-search" class="sr-only">
          Buscar en los atributos
        </label>
        <input
          id="attribute-search"
          :value="searchTerm"
          @input="$emit('search-change', $event.target.value)"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full px-3 py-2 text-sm bg-geo-background border border-geo-border rounded-md focus:ring-2 focus:ring-geo-primary focus:border-transparent text-geo-text placeholder-geo-text/60"
          :aria-describedby="searchTerm ? 'search-results' : undefined"
        >
      </div>

      <!-- Records Per Page Selector -->
      <div class="flex items-center space-x-2">
        <label
          for="records-per-page"
          class="text-sm text-geo-text/60"
        >
          Mostrar:
        </label>
        <select
          id="records-per-page"
          :value="recordsPerPage"
          @change="$emit('records-change', parseInt($event.target.value))"
          class="text-sm bg-geo-background border border-geo-border rounded-md px-2 py-1 text-geo-text"
          :aria-label="recordsAriaLabel"
        >
          <option
            v-for="option in recordsOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>
    </section>

    <!-- Search Results Announcement -->
    <div
      v-if="searchTerm && totalResults !== null"
      id="search-results"
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ searchResultsMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  searchTerm: {
    type: String,
    required: true
  },
  recordsPerPage: {
    type: Number,
    required: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar en los atributos...'
  },
  recordsOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  },
  totalResults: {
    type: Number,
    default: null
  }
})

defineEmits(['search-change', 'records-change'])

const recordsAriaLabel = computed(() =>
  `Número de registros por página, actualmente ${props.recordsPerPage}`
)

const searchResultsMessage = computed(() => {
  if (props.totalResults === null) return ''

  return props.totalResults === 0
    ? 'No se encontraron resultados'
    : `Se encontraron ${props.totalResults} resultado${props.totalResults !== 1 ? 's' : ''}`
})
</script>
