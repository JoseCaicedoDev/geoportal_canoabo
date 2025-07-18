<script setup>
import { ref } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import TheSidebar from '@/components/TheSidebar.vue'
import TheMap from '@/components/TheMap.vue'
import AttributeTable from '@/components/AttributeTable.vue'

const showAttributeTable = ref(false)
const currentLayerId = ref(null)

const handleShowAttributes = (layerId) => {
  currentLayerId.value = layerId
  showAttributeTable.value = true
}

const handleCloseAttributes = () => {
  showAttributeTable.value = false
}
</script>

<template>
  <div class="fixed inset-0 flex flex-col bg-geo-light">
    <TheHeader class="flex-none" />
    <main class="flex-1 flex min-h-0">
      <TheSidebar
        @show-attributes="handleShowAttributes"
        class="w-[300px] flex-none overflow-hidden"
      />
      <div class="flex-1 relative min-w-0">
        <TheMap class="absolute inset-0" />
        <AttributeTable
          v-if="currentLayerId"
          :layer-id="currentLayerId"
          :is-visible="showAttributeTable"
          @close="handleCloseAttributes"
          class="absolute bottom-0 left-0 right-0 z-10"
        />
      </div>
    </main>
  </div>
</template>

