<template>
  <ion-header>
    <ion-toolbar color="primary">
      <!-- Business Name and Address -->
      <div class="header-business-info">
        <h1 class="business-name">{{ businessName || 'Загрузка...' }}</h1>
        <p class="business-address">{{ businessAddress || '' }}</p>
      </div>

      <!-- Action Buttons (слот для кнопок) -->
      <ion-buttons slot="end">
        <slot name="actions"></slot>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonHeader, IonToolbar, IonButtons } from '@ionic/vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

const authStore = useAuthStore()

const businessName = computed(() => authStore.businessName)
const businessAddress = computed(() => authStore.businessAddress)
</script>

<style scoped>
.header-business-info {
  padding: 8px 16px 8px 16px;
}

.business-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  line-height: 1.3;
}

.business-address {
  margin: 2px 0 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.2;
}
</style>
