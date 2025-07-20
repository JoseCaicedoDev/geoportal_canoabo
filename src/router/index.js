import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Ruta raíz - redirige automáticamente al idioma detectado
    {
      path: '/',
      redirect: to => {
        // Detectar idioma del navegador
        const browserLang = navigator.language || navigator.userLanguage
        const langCode = browserLang.split('-')[0].toLowerCase()
        const supportedLangs = ['es', 'en']
        const detectedLang = supportedLangs.includes(langCode) ? langCode : 'es'

        return `/${detectedLang}`
      }
    },
    // Rutas con idioma
    {
      path: '/:lang(es|en)',
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
      ],
    },
    // Capturar rutas no encontradas y redirigir al home
    {
      path: '/:pathMatch(.*)*',
      redirect: '/es'
    }
  ],
})

export default router
