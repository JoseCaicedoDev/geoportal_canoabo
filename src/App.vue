<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <nav class="container mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-8">
            <RouterLink to="/" class="text-xl font-bold text-primary">GeoPortal</RouterLink>
            <div class="space-x-4">
              <RouterLink
                to="/"
                class="text-gray-600 hover:text-primary transition-colors"
                active-class="text-primary"
              >
                Inicio
              </RouterLink>
              <RouterLink
                to="/about"
                class="text-gray-600 hover:text-primary transition-colors"
                active-class="text-primary"
              >
                Acerca de
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

