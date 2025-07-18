<script setup>
import TheHeader from '@/components/TheHeader.vue'
import TheSidebar from '@/components/TheSidebar.vue'
import TheMap from '@/components/TheMap.vue'
import AttributePanel from '@/components/AttributePanel.vue'
</script>

<template>
  <div class="fixed inset-0 flex flex-col bg-geo-light">
    <TheHeader class="flex-none" />
    <main class="flex-1 flex min-h-0">
      <TheSidebar class="w-[300px] flex-none overflow-hidden" />
      <div class="flex-1 relative min-w-0">
        <TheMap class="absolute inset-0" />
        <AttributePanel class="absolute bottom-0 left-0 right-0 z-10" />
      </div>
    </main>
  </div>
</template>

