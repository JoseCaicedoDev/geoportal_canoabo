import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

// Función para detectar idioma del navegador
function getDefaultLocale() {
  const browserLang = navigator.language || navigator.userLanguage
  const langCode = browserLang.split('-')[0].toLowerCase()
  const supportedLocales = ['es', 'en']
  return supportedLocales.includes(langCode) ? langCode : 'es'
}

// Función para obtener idioma desde URL
function getLocaleFromRoute() {
  const path = window.location.pathname
  const langMatch = path.match(/^\/([a-z]{2})/)
  return langMatch ? langMatch[1] : null
}

// Determinar idioma inicial
const initialLocale = getLocaleFromRoute() || getDefaultLocale()

const i18n = createI18n({
  legacy: false, // Usar Composition API
  locale: initialLocale,
  fallbackLocale: 'es',
  globalInjection: true, // Permitir usar $t en templates
  messages: {
    es,
    en
  },
  // Configuración adicional para números y fechas
  datetimeFormats: {
    es: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      }
    },
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  },
  numberFormats: {
    es: {
      currency: {
        style: 'currency',
        currency: 'EUR',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    },
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    }
  }
})

export default i18n
