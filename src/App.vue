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
  <div class="h-screen flex flex-col bg-geo-light">
    <TheHeader />
    <div class="flex-1 flex">
      <TheSidebar @show-attributes="handleShowAttributes" />
      <div class="flex-1 relative flex flex-col">
        <TheMap />
        <AttributeTable
          v-if="currentLayerId"
          :layer-id="currentLayerId"
          :is-visible="showAttributeTable"
          @close="handleCloseAttributes"
        />
      </div>
    </div>
  </div>
</template>

