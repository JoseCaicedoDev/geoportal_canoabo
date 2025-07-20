<script setup>
import { onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import TheSidebar from '@/components/TheSidebar.vue'
import TheMap from '@/components/TheMap.vue'
import AttributePanel from '@/components/AttributePanel.vue'
import LayerDetailsModal from '@/components/LayerDetailsModal.vue'
import { useLayerStore } from '@/stores/layerStore'
import { useI18nSync } from '@/composables/useI18nSync'
import { storeToRefs } from 'pinia'

const layerStore = useLayerStore()
const { layerDetailsModalVisible, currentLayerDetails } = storeToRefs(layerStore)
const { switchLanguage } = useI18nSync()

// Inicializar idioma cuando la app se monta
onMounted(() => {
  // La inicialización del idioma se maneja automáticamente por el router y el composable
})
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

    <!-- Layer Details Modal -->
    <LayerDetailsModal
      :show="layerDetailsModalVisible"
      :layer-id="currentLayerDetails?.id || ''"
      :layer-name="currentLayerDetails?.name || ''"
      @close="layerStore.hideLayerDetails"
    />
  </div>
</template>

