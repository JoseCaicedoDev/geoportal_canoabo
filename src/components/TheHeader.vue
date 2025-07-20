<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useI18n()

// Importamos el composable de dark mode
const { isDarkMode, toggleDarkMode } = useDarkMode()

// Importamos el composable de idioma y inicializamos
const { initializeLanguage } = useLanguage()

// Computed property para el título del botón de modo oscuro/claro
const darkModeTitle = computed(() => {
  return isDarkMode.value
    ? t('header.lightModeToggle')
    : t('header.darkModeToggle')
})

// Inicializar el idioma cuando el componente se monta
initializeLanguage()
</script>

<template>
  <header class="bg-geo-background shadow-lg border-b-2 border-geo-primary dark:border-geo-border">
    <div class="flex items-center justify-between px-6 py-4">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-geo-primary rounded-lg flex items-center justify-center">
            <i class="fas fa-globe text-white text-sm"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-geo-text">{{ $t('app.title') }}</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('app.subtitle') }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <button
          class="p-2 rounded-lg hover:bg-geo-hover transition-colors text-geo-text"
          @click="toggleDarkMode"
          :title="darkModeTitle"
          :aria-label="darkModeTitle"
        >
          <i :class="[
            'fas',
            isDarkMode ? 'fa-sun' : 'fa-moon'
          ]"></i>
        </button>
      </div>
    </div>
  </header>
</template>
