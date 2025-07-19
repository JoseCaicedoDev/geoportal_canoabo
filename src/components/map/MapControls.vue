<template>
  <nav
    class="absolute top-4 right-4 space-y-2 z-10"
    role="navigation"
    aria-label="Controles del mapa"
  >
    <!-- Zoom Controls -->
    <section
      class="bg-geo-background rounded-lg shadow-lg border border-geo-border"
      role="group"
      aria-label="Controles de zoom"
    >
      <button
        @click="$emit('zoom-in')"
        class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-t-lg"
        :title="zoomInTitle"
        :aria-label="zoomInTitle"
        type="button"
      >
        <i class="fas fa-plus text-geo-text/60 text-sm" aria-hidden="true"></i>
      </button>
      <div class="border-t border-geo-border" role="separator"></div>
      <button
        @click="$emit('zoom-out')"
        class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-b-lg"
        :title="zoomOutTitle"
        :aria-label="zoomOutTitle"
        type="button"
      >
        <i class="fas fa-minus text-geo-text/60 text-sm" aria-hidden="true"></i>
      </button>
    </section>

    <!-- Home Control -->
    <section
      class="bg-geo-background rounded-lg shadow-lg border border-geo-border"
      role="group"
      aria-label="Navegación del mapa"
    >
      <button
        @click="$emit('zoom-to-home')"
        class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-lg"
        :title="homeTitle"
        :aria-label="homeTitle"
        type="button"
      >
        <i class="fas fa-home text-geo-text/60 text-sm" aria-hidden="true"></i>
      </button>
    </section>

    <!-- Fullscreen Control -->
    <section
      class="bg-geo-background rounded-lg shadow-lg border border-geo-border"
      role="group"
      aria-label="Vista del mapa"
    >
      <button
        @click="$emit('toggle-fullscreen')"
        class="w-8 h-8 flex items-center justify-center hover:bg-geo-hover transition-colors rounded-lg"
        :title="fullscreenTitle"
        :aria-label="fullscreenTitle"
        type="button"
      >
        <i
          :class="[isFullscreen ? 'fas fa-compress' : 'fas fa-expand', 'text-geo-text/60 text-sm']"
          aria-hidden="true"
        ></i>
      </button>
    </section>
  </nav>
</template>

<script setup>
const props = defineProps({
  isFullscreen: {
    type: Boolean,
    default: false
  },
  zoomInTitle: {
    type: String,
    default: 'Acercar'
  },
  zoomOutTitle: {
    type: String,
    default: 'Alejar'
  },
  homeTitle: {
    type: String,
    default: 'Vista inicial'
  },
  fullscreenTitle: {
    type: String,
    default: 'Pantalla completa'
  }
})

defineEmits(['zoom-in', 'zoom-out', 'zoom-to-home', 'toggle-fullscreen'])
</script>
