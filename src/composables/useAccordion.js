import { ref } from 'vue'

export function useAccordion() {
  const openSections = ref(new Set())

  const toggleSection = (sectionId) => {
    if (openSections.value.has(sectionId)) {
      openSections.value.delete(sectionId)
    } else {
      openSections.value.add(sectionId)
    }
  }

  const isSectionOpen = (sectionId) => {
    return openSections.value.has(sectionId)
  }

  return {
    openSections,
    toggleSection,
    isSectionOpen
  }
}
