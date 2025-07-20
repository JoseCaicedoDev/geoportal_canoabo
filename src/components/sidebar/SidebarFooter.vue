<template>
  <footer
    class="bg-green-600 p-3 mt-auto border-t border-green-700"
    role="contentinfo"
  >
    <div class="flex items-center space-x-2">
      <p class="text-sm text-white font-medium">
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
