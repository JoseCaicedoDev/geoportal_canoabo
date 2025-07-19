<template>
  <footer
    class="bg-geo-dark p-2 mt-auto dark:bg-geo-dark/50"
    role="contentinfo"
  >
    <div class="flex items-center space-x-2">
      <p class="text-sm text-geo-text/80">
        © {{ currentYear }} {{ brand }} - Powered by {{ poweredBy }}
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  brand: {
    type: String,
    default: 'Gira360'
  },
  poweredBy: {
    type: String,
    default: 'JC'
  }
})

const currentYear = computed(() => new Date().getFullYear())
</script>
