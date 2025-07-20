import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { useLanguage } from './useLanguage'

// Composable para sincronizar i18n con el sistema de idiomas
export function useI18nSync() {
  const { locale } = useI18n()
  const { language, changeLanguage } = useLanguage()

  // Sincronizar i18n locale con el idioma del sistema
  watch(language, (newLang) => {
    if (locale.value !== newLang) {
      locale.value = newLang
    }
  }, { immediate: true })

  // Función para cambiar idioma que sincroniza ambos sistemas
  const switchLanguage = (newLang) => {
    changeLanguage(newLang)
    locale.value = newLang
  }

  return {
    locale,
    switchLanguage,
    currentLanguage: language
  }
}
