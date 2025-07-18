import { ref, onMounted, watch } from 'vue'

export function useDarkMode() {
  const isDarkMode = ref(false)

  // Colores basados en GitHub dark mode
  const colors = {
    light: {
      primary: '#16a34a',
      secondary: '#0ea5e9',
      accent: '#f59e0b',
      dark: '#1e293b',
      light: '#f8fafc',
      background: '#ffffff',
      text: '#1F2328',
      border: '#d0d7de',
      hover: '#f6f8fa'
    },
    dark: {
      primary: '#238636',
      secondary: '#1F6FEB',
      accent: '#F7B955',
      dark: '#0d1117',
      light: '#161b22',
      background: '#0d1117',
      text: '#e6edf3',
      border: '#30363d',
      hover: '#21262d'
    }
  }

  const getColor = (colorName) => {
    return isDarkMode.value ? colors.dark[colorName] : colors.light[colorName]
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    updateTheme()
  }

  const updateTheme = () => {
    // Actualizar variables CSS
    const root = document.documentElement
    const theme = isDarkMode.value ? colors.dark : colors.light

    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--geo-${key}`, value)
    })

    // Actualizar clases Tailwind
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Guardar preferencia
    localStorage.setItem('darkMode', isDarkMode.value)
  }

  onMounted(() => {
    // Recuperar preferencia guardada o usar preferencia del sistema
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) {
      isDarkMode.value = savedTheme === 'true'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()

    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        isDarkMode.value = e.matches
        updateTheme()
      }
    })
  })

  watch(isDarkMode, () => {
    updateTheme()
  })

  return {
    isDarkMode,
    toggleDarkMode,
    getColor
  }
}
