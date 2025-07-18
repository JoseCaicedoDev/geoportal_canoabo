<script setup>
import { ref } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

// Importamos el composable de dark mode
const { isDarkMode, toggleDarkMode } = useDarkMode()

// Estado para el idioma
const currentLanguage = ref('ES')

const changeLanguage = (lang) => {
  currentLanguage.value = lang
  // Aquí implementaremos la lógica para cambiar el idioma
}
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
            <h1 class="text-xl font-bold text-geo-text">GeoCanoabo</h1>
            <p class="text-sm text-geo-text/60">Territorio en Datos</p>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <button
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              currentLanguage === 'ES'
                ? 'bg-geo-primary text-white hover:bg-green-600'
                : 'bg-geo-hover text-geo-text hover:bg-geo-hover/80'
            ]"
            @click="changeLanguage('ES')"
          >ES</button>
          <button
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              currentLanguage === 'EN'
                ? 'bg-geo-primary text-white hover:bg-green-600'
                : 'bg-geo-hover text-geo-text hover:bg-geo-hover/80'
            ]"
            @click="changeLanguage('EN')"
          >EN</button>
        </div>

        <button
          class="p-2 rounded-lg hover:bg-geo-hover transition-colors text-geo-text"
          @click="toggleDarkMode"
          :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
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
