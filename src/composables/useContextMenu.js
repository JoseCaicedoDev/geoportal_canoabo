import { ref } from 'vue'
import { layerService } from '@/services/layerService'

export function useContextMenu() {
  const contextMenu = ref(null)
  const menuPosition = ref({ x: 0, y: 0 })
  const currentLayer = ref(null)
  const showMenu = ref(false)

  const menuItems = [
    { icon: 'fas fa-eye', text: 'Ver detalles', action: 'showDetails' },
    { icon: 'fas fa-table', text: 'Ver atributos', action: 'showAttributes' },
    { icon: 'fas fa-palette', text: 'Cambiar estilo', action: 'changeStyle' },
    { icon: 'fas fa-download', text: 'Descargar', action: 'downloadLayer' },
    { icon: 'fas fa-info-circle', text: 'Propiedades', action: 'showProperties' }
  ]

  const hideContextMenu = () => {
    showMenu.value = false
    currentLayer.value = null
  }

  const handleAction = async (action) => {
    if (!currentLayer.value) return

    switch (action) {
      case 'showDetails':
        // TO-DO: Implementar visualización de detalles
        break
      case 'showAttributes':
        // Esta acción será manejada por el componente padre
        break
      case 'changeStyle':
        await layerService.changeLayerStyle(currentLayer.value)
        break
      case 'downloadLayer':
        await layerService.exportLayer(currentLayer.value)
        break
      case 'showProperties':
        const properties = await layerService.showLayerProperties(currentLayer.value)
        break
    }

    hideContextMenu()
  }

  const showContextMenu = (event, layerId) => {
    event.preventDefault()
    event.stopPropagation()

    menuPosition.value = {
      x: event.clientX,
      y: event.clientY
    }

    currentLayer.value = layerId
    showMenu.value = true
  }

  // Ocultar menú al hacer clic fuera
  if (typeof window !== 'undefined') {
    window.addEventListener('click', (e) => {
      if (showMenu.value && !e.target.closest('.context-menu')) {
        hideContextMenu()
      }
    })
  }

  return {
    menuPosition,
    currentLayer,
    showMenu,
    menuItems,
    showContextMenu,
    hideContextMenu,
    handleAction
  }
}
