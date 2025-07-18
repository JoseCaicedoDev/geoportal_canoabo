import { defineStore } from 'pinia'
import { ref } from 'vue'
import { layerService } from '@/services/layerService'

export const useLayerStore = defineStore('layer', () => {
  // Inicializar con capas por defecto activas
  const selectedLayers = ref(new Set(['suelos-wfs', 'perimetro-wfs']))
  const activeContextMenu = ref(null)
  const attributePanelVisible = ref(false)
  const currentLayerId = ref(null)

  // Manejo de capas seleccionadas
  const toggleLayer = (layerId) => {
    if (selectedLayers.value.has(layerId)) {
      selectedLayers.value.delete(layerId)
    } else {
      selectedLayers.value.add(layerId)
    }
  }

  // Manejo del menú contextual
  const showContextMenu = (event, layerId) => {
    event.preventDefault()
    event.stopPropagation()

    activeContextMenu.value = {
      layerId,
      x: event.pageX,
      y: event.pageY
    }
  }

  const hideContextMenu = () => {
    activeContextMenu.value = null
  }

  // Acciones del menú contextual
  const showLayerDetails = async (layerId) => {
    const details = await layerService.showLayerProperties(layerId)
    console.log('Detalles de capa:', details)
    // Aquí se podría emitir un evento o mostrar un modal con los detalles
  }

  const showAttributeTable = (layerId) => {
    console.log('showAttributeTable called with layerId:', layerId)
    currentLayerId.value = layerId
    attributePanelVisible.value = true
    console.log('After setting values - currentLayerId:', currentLayerId.value, 'attributePanelVisible:', attributePanelVisible.value)
  }

  const changeLayerStyle = async (layerId) => {
    // Aquí se podría abrir un modal de estilos
    const newStyle = { color: 'blue-600' } // Ejemplo
    await layerService.changeLayerStyle(layerId, newStyle)
  }

  const downloadLayer = async (layerId) => {
    try {
      const result = await layerService.exportLayer(layerId)
      // Aquí se podría implementar la descarga real del archivo
      const a = document.createElement('a')
      const url = window.URL.createObjectURL(result.blob)
      a.href = url
      a.download = result.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error al descargar la capa:', error)
    }
  }

  return {
    selectedLayers,
    activeContextMenu,
    attributePanelVisible,
    currentLayerId,
    toggleLayer,
    showContextMenu,
    hideContextMenu,
    showLayerDetails,
    showAttributeTable,
    changeLayerStyle,
    downloadLayer
  }
})
