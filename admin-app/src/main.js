import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import { createPinia } from 'pinia'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Import Quasar css
import 'quasar/dist/quasar.css'

// Import app styles
import './css/app.scss'

import App from './App.vue'
import router from './router'
import axios from './boot/axios'

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  }
})

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Setup router guards AFTER app is fully configured
router.beforeEach((to, from, next) => {
  // Check authentication via localStorage directly to avoid Pinia timing issues
  const hasToken = !!localStorage.getItem('accessToken')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !hasToken) {
    next({ name: 'login' })
  } else if (to.name === 'login' && hasToken) {
    next({ name: 'home' })
  } else {
    next()
  }
})

// Boot axios
axios({ app })

app.mount('#q-app')
