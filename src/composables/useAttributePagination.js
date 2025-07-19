import { ref, computed, watch } from 'vue'

/**
 * Composable for managing table pagination
 * Handles page navigation, records per page, and pagination state
 */
export function useAttributePagination(totalRecords, recordsPerPage = 10) {
  // State
  const currentPage = ref(1)
  const itemsPerPage = ref(recordsPerPage)

  // Computed
  const totalPages = computed(() =>
    Math.ceil(totalRecords.value / itemsPerPage.value)
  )

  const startIndex = computed(() =>
    (currentPage.value - 1) * itemsPerPage.value
  )

  const endIndex = computed(() =>
    Math.min(startIndex.value + itemsPerPage.value, totalRecords.value)
  )

  const hasNextPage = computed(() =>
    currentPage.value < totalPages.value
  )

  const hasPreviousPage = computed(() =>
    currentPage.value > 1
  )

  const paginationInfo = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    startIndex: startIndex.value,
    endIndex: endIndex.value,
    totalRecords: totalRecords.value,
    hasNextPage: hasNextPage.value,
    hasPreviousPage: hasPreviousPage.value
  }))

  // Methods
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const previousPage = () => {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  const firstPage = () => {
    currentPage.value = 1
  }

  const lastPage = () => {
    currentPage.value = totalPages.value
  }

  const setRecordsPerPage = (records) => {
    itemsPerPage.value = records
    // Reset to first page when changing page size
    currentPage.value = 1
  }

  const resetPagination = () => {
    currentPage.value = 1
  }

  // Watch for total records changes to adjust current page if needed
  watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages && newTotalPages > 0) {
      currentPage.value = newTotalPages
    }
  })

  // Watch for records per page changes
  watch(itemsPerPage, () => {
    resetPagination()
  })

  return {
    // State
    currentPage,
    itemsPerPage,

    // Computed
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    paginationInfo,

    // Methods
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setRecordsPerPage,
    resetPagination
  }
}
