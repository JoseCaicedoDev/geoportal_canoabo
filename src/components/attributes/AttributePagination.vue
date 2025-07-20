<template>
  <nav
    class="flex items-center justify-between py-3 px-4 bg-geo-background border-t border-geo-border"
    role="navigation"
    aria-label="Paginación de tabla de atributos"
  >
    <!-- Records Info -->
    <div class="flex items-center text-sm text-geo-text/60">
      <span id="pagination-info" aria-live="polite">
        {{ $t('attributes.pagination.showing', { start: startRecord, end: endRecord, total: totalRecords }) }}
      </span>
    </div>

    <!-- Pagination Controls -->
    <div
      class="flex items-center space-x-2"
      role="group"
      aria-labelledby="pagination-label"
    >
      <span id="pagination-label" class="sr-only">
        Controles de paginación
      </span>

      <!-- First Page -->
      <button
        :disabled="currentPage === 1"
        @click="$emit('page-change', 1)"
        class="p-2 rounded-md border border-geo-border text-geo-text hover:bg-geo-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :aria-label="firstPageAriaLabel"
        type="button"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l4.293 4.293a1 1 0 010 1.414zM7 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Previous Page -->
      <button
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
        class="p-2 rounded-md border border-geo-border text-geo-text hover:bg-geo-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :aria-label="prevPageAriaLabel"
        type="button"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center space-x-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('page-change', page)"
          :class="pageButtonClasses(page)"
          :aria-label="getPageAriaLabel(page)"
          :aria-current="page === currentPage ? 'page' : false"
          type="button"
        >
          {{ page }}
        </button>
      </div>

      <!-- Next Page -->
      <button
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
        class="p-2 rounded-md border border-geo-border text-geo-text hover:bg-geo-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :aria-label="nextPageAriaLabel"
        type="button"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Last Page -->
      <button
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', totalPages)"
        class="p-2 rounded-md border border-geo-border text-geo-text hover:bg-geo-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :aria-label="lastPageAriaLabel"
        type="button"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 11H3a1 1 0 110-2h5.586L4.293 5.707a1 1 0 010-1.414zM13 17a1 1 0 001-1V4a1 1 0 10-2 0v12a1 1 0 001 1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    validator: value => value >= 1
  },
  totalRecords: {
    type: Number,
    required: true,
    validator: value => value >= 0
  },
  recordsPerPage: {
    type: Number,
    required: true,
    validator: value => value > 0
  },
  maxVisiblePages: {
    type: Number,
    default: 5,
    validator: value => value > 0
  }
})

defineEmits(['page-change'])

// Computed properties
const totalPages = computed(() =>
  Math.ceil(props.totalRecords / props.recordsPerPage)
)

const startRecord = computed(() => {
  if (props.totalRecords === 0) return 0
  return (props.currentPage - 1) * props.recordsPerPage + 1
})

const endRecord = computed(() => {
  const end = props.currentPage * props.recordsPerPage
  return Math.min(end, props.totalRecords)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  const max = props.maxVisiblePages

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const half = Math.floor(max / 2)
  let start = Math.max(1, current - half)
  let end = Math.min(total, start + max - 1)

  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// ARIA labels
const firstPageAriaLabel = computed(() =>
  `${t('attributes.pagination.firstPage')}${props.currentPage === 1 ? `, ${t('attributes.pagination.currentPage')}` : ''}`
)

const prevPageAriaLabel = computed(() =>
  `${t('attributes.pagination.previousPage')}${props.currentPage === 1 ? `, ${t('attributes.pagination.notAvailable')}` : ''}`
)

const nextPageAriaLabel = computed(() =>
  `${t('attributes.pagination.nextPage')}${props.currentPage === totalPages.value ? `, ${t('attributes.pagination.notAvailable')}` : ''}`
)

const lastPageAriaLabel = computed(() =>
  `${t('attributes.pagination.lastPage')}${props.currentPage === totalPages.value ? `, ${t('attributes.pagination.currentPage')}` : ''}`
)

// Methods
const pageButtonClasses = (page) => {
  const baseClasses = 'px-3 py-2 text-sm rounded-md border transition-colors'

  if (page === props.currentPage) {
    return `${baseClasses} bg-geo-primary text-white border-geo-primary font-medium`
  }

  return `${baseClasses} border-geo-border text-geo-text hover:bg-geo-primary/5`
}

const getPageAriaLabel = (page) => {
  if (page === props.currentPage) {
    return `Página ${page}, página actual`
  }
  return `Ir a la página ${page}`
}
</script>
