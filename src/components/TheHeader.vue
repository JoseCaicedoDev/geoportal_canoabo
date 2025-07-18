<script setup>
import { ref } from 'vue'

// Estado para el tema (modo claro/oscuro)
const isDarkMode = ref(false)

// Estado para el idioma
const currentLanguage = ref('ES')

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  // Aquí implementaremos la lógica para cambiar el tema
}

const changeLanguage = (lang) => {
  currentLanguage.value = lang
  // Aquí implementaremos la lógica para cambiar el idioma
}
</script>

<template>
  <header class="bg-white shadow-lg border-b-2 border-geo-primary">
    <div class="flex items-center justify-between px-6 py-4">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-geo-primary rounded-lg flex items-center justify-center">
            <i class="fas fa-globe text-white text-sm"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-geo-dark">GeoCanoabo</h1>
            <p class="text-sm text-gray-600">Territorio en Datos</p>
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
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
            @click="changeLanguage('ES')"
          >ES</button>
          <button
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              currentLanguage === 'EN'
                ? 'bg-geo-primary text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
            @click="changeLanguage('EN')"
          >EN</button>
        </div>

        <button
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="toggleDarkMode"
        >
          <i :class="[
            'fas',
            isDarkMode ? 'fa-sun' : 'fa-moon',
            'text-gray-600'
          ]"></i>
        </button>
      </div>
    </div>
  </header>
</template>
