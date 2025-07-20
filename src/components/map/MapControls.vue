<template>
  <nav
    class="absolute top-4 right-4 space-y-2 z-10"
    role="navigation"
    :aria-label="t('map.controls.mapNavigation')"
  >
    <!-- Zoom Controls -->
    <section
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"
      role="group"
      :aria-label="t('map.controls.zoomControls')"
    >
      <button
        @click="$emit('zoom-in')"
        class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
        :title="t('map.controls.zoomIn')"
        :aria-label="t('map.controls.zoomIn')"
        type="button"
      >
        <i class="fas fa-plus text-gray-600 dark:text-white text-sm" aria-hidden="true"></i>
      </button>
      <div class="border-t border-gray-300 dark:border-gray-600" role="separator"></div>
      <button
        @click="$emit('zoom-out')"
        class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-b-lg"
        :title="t('map.controls.zoomOut')"
        :aria-label="t('map.controls.zoomOut')"
        type="button"
      >
        <i class="fas fa-minus text-gray-600 dark:text-white text-sm" aria-hidden="true"></i>
      </button>
    </section>

    <!-- Home Control -->
    <section
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"
      role="group"
      :aria-label="t('map.controls.mapNavigation')"
    >
      <button
        @click="$emit('zoom-to-home')"
        class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
        :title="t('map.controls.home')"
        :aria-label="t('map.controls.home')"
        type="button"
      >
        <i class="fas fa-home text-gray-600 dark:text-white text-sm" aria-hidden="true"></i>
      </button>
    </section>

    <!-- Fullscreen Control -->
    <section
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"
      role="group"
      :aria-label="t('map.controls.mapView')"
    >
      <button
        @click="$emit('toggle-fullscreen')"
        class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
        :title="fullscreenTitle"
        :aria-label="fullscreenTitle"
        type="button"
      >
        <i
          :class="[isFullscreen ? 'fas fa-compress' : 'fas fa-expand', 'text-gray-600 dark:text-white text-sm']"
          aria-hidden="true"
        ></i>
      </button>
    </section>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isFullscreen: {
    type: Boolean,
    default: false
  }
})

// Computed property para el título de fullscreen que cambia según el estado
const fullscreenTitle = computed(() => {
  return props.isFullscreen
    ? t('map.controls.exitFullscreen')
    : t('map.controls.fullscreen')
})

defineEmits(['zoom-in', 'zoom-out', 'zoom-to-home', 'toggle-fullscreen'])
</script>
