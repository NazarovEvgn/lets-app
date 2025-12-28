<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  // Load user profile if already authenticated
  if (authStore.isAuthenticated && authStore.userType === 'client') {
    await authStore.fetchUserProfile()
  }
})
</script>
