import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Idiomas soportados
const SUPPORTED_LANGUAGES = ['es', 'en']
const DEFAULT_LANGUAGE = 'es'

// Estado global del idioma
const currentLanguage = ref(DEFAULT_LANGUAGE)

export function useLanguage() {
  const router = useRouter()
  const route = useRoute()

  // Detectar idioma del navegador
  const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage
    const langCode = browserLang.split('-')[0].toLowerCase()
    return SUPPORTED_LANGUAGES.includes(langCode) ? langCode : DEFAULT_LANGUAGE
  }

  // Inicializar idioma desde URL o detectar automáticamente
  const initializeLanguage = () => {
    // Verificar si hay idioma en la URL
    const urlLang = route.params.lang
    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      currentLanguage.value = urlLang
      return urlLang
    }

    // Si no hay idioma en URL, detectar del navegador
    const detectedLang = detectBrowserLanguage()
    currentLanguage.value = detectedLang

    // Redirigir a la URL con el idioma detectado
    const newPath = `/${detectedLang}${route.path === '/' ? '' : route.path}`
    router.replace(newPath)

    return detectedLang
  }

  // Cambiar idioma y actualizar URL
  const changeLanguage = (newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return

    currentLanguage.value = newLang

    // Actualizar la URL con el nuevo idioma
    const currentPath = route.path
    const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}/, '') || '/'
    const newPath = `/${newLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`

    router.push(newPath)
  }

  // Computed para obtener el idioma actual
  const language = computed(() => currentLanguage.value)

  // Computed para verificar si es un idioma específico
  const isSpanish = computed(() => currentLanguage.value === 'es')
  const isEnglish = computed(() => currentLanguage.value === 'en')

  return {
    language,
    isSpanish,
    isEnglish,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    initializeLanguage,
    changeLanguage,
    detectBrowserLanguage
  }
}
