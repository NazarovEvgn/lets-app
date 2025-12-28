<template>
  <ion-card class="business-card" @click="$emit('click')">
    <ion-card-content>
      <div class="card-content">
        <!-- Left: Logo/Icon -->
        <div class="business-logo">
          <img
            v-if="business.logo_url"
            :src="logoFullUrl"
            :alt="business.name"
            class="logo-image"
          />
          <div v-else class="logo-placeholder">
            <ion-icon :icon="businessOutline" />
          </div>
        </div>

        <!-- Middle: Info -->
        <div class="business-info">
          <h3 class="business-name">{{ business.name }}</h3>
          <p class="business-type">{{ businessTypeLabel }}</p>
          <p v-if="business.address" class="business-address">{{ business.address }}</p>
        </div>

        <!-- Right: Actions -->
        <div class="business-actions">
          <ion-button
            fill="clear"
            size="small"
            @click.stop="toggleFavorite"
            class="favorite-btn"
          >
            <ion-icon
              :icon="isFavorite ? star : starOutline"
              :class="{ 'favorite-active': isFavorite }"
            />
          </ion-button>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/vue'
import { star, starOutline, businessOutline } from 'ionicons/icons'
import type { Business } from '../types'
import { API_BASE_URL } from '@/core/config'

interface Props {
  business: Business
  isFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorite: false,
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'toggleFavorite', businessId: number): void
}>()

const businessTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    car_wash: 'Автомойка',
    auto_repair: 'Автосервис',
    tire_service: 'Шиномонтаж',
    beauty_salon: 'Салон красоты',
  }
  return labels[props.business.business_type] || props.business.business_type
})

const logoFullUrl = computed(() => {
  if (!props.business.logo_url) return ''
  // If URL already includes http/https, return as is
  if (props.business.logo_url.startsWith('http')) {
    return props.business.logo_url
  }
  // Otherwise, prepend base URL
  const baseUrl = API_BASE_URL.replace('/api/v1', '')
  return `${baseUrl}${props.business.logo_url}`
})

function toggleFavorite() {
  emit('toggleFavorite', props.business.id)
}
</script>

<style scoped>
.business-card {
  margin: 12px 0;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
}

.business-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.business-card ion-card-content {
  padding: 16px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.business-logo {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #27126A 0%, #4527a0 100%);
  color: white;
  font-size: 28px;
}

.business-info {
  flex: 1;
  min-width: 0;
}

.business-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.business-type {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

.business-address {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.business-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.favorite-btn {
  --color: var(--ion-color-medium);
}

.favorite-btn ion-icon {
  font-size: 24px;
  transition: all 0.2s ease;
}

.favorite-btn ion-icon.favorite-active {
  color: #FFD700;
}

.favorite-btn:hover ion-icon {
  transform: scale(1.1);
}
</style>
