<template>
  <ion-page>
    <ion-header class="custom-header">
      <ion-toolbar class="header-toolbar">
        <!-- Client Profile -->
        <div slot="start" class="profile-header" @click="router.push('/profile')">
          <div class="avatar-small">
            <img
              v-if="profileStore.profile?.avatar_url"
              :src="getFullAvatarUrl(profileStore.profile.avatar_url)"
              alt="Avatar"
            />
            <ion-icon v-else :icon="personCircleOutline"></ion-icon>
          </div>
          <div class="profile-info">
            <div class="profile-name">{{ profileStore.profile?.name || 'Гость' }}</div>
            <div class="profile-link">Ваши настройки ></div>
          </div>
        </div>

        <!-- Favorites and Notifications Buttons -->
        <ion-buttons slot="end">
          <!-- Favorites Button -->
          <ion-button @click="toggleFavoritesView">
            <ion-icon
              slot="icon-only"
              :icon="showingFavorites ? heart : heartOutline"
              class="favorites-icon"
            ></ion-icon>
          </ion-button>

          <!-- Notifications Button -->
          <div class="notifications-button-wrapper">
            <ion-button id="notifications-trigger">
              <ion-icon slot="icon-only" :icon="notificationsOutline" class="notifications-icon"></ion-icon>
            </ion-button>
            <ion-badge v-if="unreadNotifications > 0" color="danger" class="notifications-badge">{{ unreadNotifications }}</ion-badge>
          </div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Современное поле поиска -->
      <div class="search-panel">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="найти"
          :debounce="500"
          animated
          show-clear-button="focus"
          class="custom-searchbar"
          @ionInput="handleSearch"
          @ionClear="handleClear"
        ></ion-searchbar>
      </div>

      <!-- Loading -->
      <div v-if="businessesStore.loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Empty State -->
      <div v-else-if="displayedBusinesses.length === 0" class="empty-state">
        <ion-icon
          :icon="showingFavorites ? heartOutline : businessOutline"
          size="large"
          color="medium"
        ></ion-icon>
        <p v-if="showingFavorites">Нет избранных сервисов</p>
        <p v-else-if="searchQuery">Ничего не найдено</p>
        <p v-else class="welcome-message">
          Используйте поиск для поиска сервисов<br>
          или добавьте их в избранное
        </p>
      </div>

      <!-- Business List -->
      <div v-else class="business-list">
        <ion-card
          v-for="business in displayedBusinesses"
          :key="business.id"
          class="business-card-modern"
          button
          @click="selectBusiness(business)"
        >
          <ion-card-content>
            <div class="card-layout">
              <!-- Logo/Avatar -->
              <div class="business-logo">
                <img
                  v-if="business.logo_url"
                  :src="getFullLogoUrl(business.logo_url)"
                  :alt="business.name"
                />
                <div v-else class="logo-placeholder">
                  {{ business.name.charAt(0).toUpperCase() }}
                </div>
              </div>

              <!-- Business Info -->
              <div class="business-content">
                <h3 class="business-name">{{ business.name }}</h3>
                <p class="business-type-label">{{ businessTypeLabel(business.business_type) }}</p>
                <div class="business-meta">
                  <div class="meta-row">
                    <ion-icon :icon="locationOutline"></ion-icon>
                    <span>{{ business.address }}</span>
                  </div>
                  <div class="meta-row">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span>Пн-Вс 9:00-21:00</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <ion-button
                    fill="outline"
                    class="call-button"
                    @click="call(business.phone, $event)"
                  >
                    Позвонить
                  </ion-button>
                  <ion-button
                    class="book-button"
                    @click="bookService(business, $event)"
                  >
                    Записаться
                  </ion-button>
                </div>
              </div>

              <!-- Favorite Button -->
              <ion-button
                fill="clear"
                class="favorite-button-card"
                @click="toggleFavorite(business, $event)"
              >
                <ion-icon
                  slot="icon-only"
                  :icon="isFavorite(business.id) ? heart : heartOutline"
                  :class="{ 'favorite-active': isFavorite(business.id) }"
                ></ion-icon>
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <!-- Notifications Popover -->
    <ion-popover trigger="notifications-trigger" :dismiss-on-select="true">
      <ion-content class="notifications-popover">
        <div class="notifications-header">
          <h3>Уведомления</h3>
          <ion-button
            v-if="notifications.length > 0"
            fill="clear"
            size="small"
            @click="markAllAsRead"
          >
            Отметить все
          </ion-button>
        </div>

        <!-- Notifications List -->
        <ion-list v-if="notifications.length > 0" class="notifications-list">
          <ion-item
            v-for="notification in notifications"
            :key="notification.id"
            :class="{ 'unread': !notification.read }"
            button
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <div class="notification-icon" :class="`type-${notification.type}`">
                <ion-icon
                  :icon="getNotificationIcon(notification.type)"
                ></ion-icon>
              </div>
              <div class="notification-text">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTime(notification.time) }}</div>
              </div>
            </div>
          </ion-item>
        </ion-list>

        <!-- Empty State -->
        <div v-else class="notifications-empty">
          <ion-icon :icon="notificationsOffOutline" size="large"></ion-icon>
          <p>Нет уведомлений</p>
        </div>
      </ion-content>
    </ion-popover>

    <!-- Business Details Modal -->
    <ion-modal :is-open="!!selectedBusiness" @did-dismiss="selectedBusiness = null">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ selectedBusiness?.name }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="selectedBusiness = null">
              <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content v-if="selectedBusiness" class="ion-padding">
        <ion-card>
          <ion-card-content>
            <div class="modal-detail-row">
              <strong>Тип:</strong>
              <span>{{ businessTypeLabel(selectedBusiness.business_type) }}</span>
            </div>
            <div class="modal-detail-row">
              <strong>Статус:</strong>
              <ion-badge :color="statusColor(selectedBusiness.status?.status || 'available')">
                {{ statusLabel(selectedBusiness.status?.status || 'available') }}
              </ion-badge>
            </div>
            <div class="modal-detail-row">
              <strong>Адрес:</strong>
              <span>{{ selectedBusiness.address }}</span>
            </div>
            <div class="modal-detail-row">
              <strong>Телефон:</strong>
              <span>{{ selectedBusiness.phone }}</span>
            </div>
            <div v-if="selectedBusiness.status" class="modal-detail-row">
              <strong>Ожидание:</strong>
              <span>~{{ selectedBusiness.status.estimated_wait_minutes }} минут</span>
            </div>
            <div v-if="selectedBusiness.description" class="modal-detail-row">
              <strong>Описание:</strong>
              <p>{{ selectedBusiness.description }}</p>
            </div>
          </ion-card-content>
        </ion-card>

        <div class="action-buttons">
          <ion-button expand="block" color="primary" @click="call(selectedBusiness.phone)">
            <ion-icon slot="start" :icon="callOutline"></ion-icon>
            Позвонить
          </ion-button>
          <ion-button expand="block" color="secondary" @click="bookService(selectedBusiness)">
            <ion-icon slot="start" :icon="calendarOutline"></ion-icon>
            Записаться
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonModal,
  IonCard,
  IonCardContent,
  IonPopover,
} from '@ionic/vue'
import {
  notificationsOutline,
  notificationsOffOutline,
  businessOutline,
  locationOutline,
  callOutline,
  timeOutline,
  closeOutline,
  calendarOutline,
  personCircleOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  heartOutline,
  heart,
} from 'ionicons/icons'
import { useBusinessesStore } from '../stores/businessesStore'
import { useProfileStore } from '@/features/profile/stores/profileStore'
import { useFavoritesStore } from '@/features/favorites/stores/favoritesStore'
import type { Business, BusinessType, BusinessStatus } from '../types'
import { API_BASE_URL } from '@/core/config'

const router = useRouter()
const businessesStore = useBusinessesStore()
const profileStore = useProfileStore()
const favoritesStore = useFavoritesStore()

const searchQuery = ref('')
const selectedBusiness = ref<Business | null>(null)
const showingFavorites = ref(false)

// Notifications state
interface Notification {
  id: number
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  time: Date
  read: boolean
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'success',
    title: 'Запись подтверждена',
    message: 'Ваша запись на 15:00 успешно подтверждена',
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Напоминание',
    message: 'Через 1 час ваша запись в "Автомойка №1"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Изменение времени',
    message: 'Время вашей записи изменено на 16:00',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
])

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const displayedBusinesses = computed(() => {
  if (showingFavorites.value) {
    // Show only favorited businesses
    const favoriteIds = favoritesStore.favorites.map(f => f.business_id)
    return businessesStore.businesses.filter(b => favoriteIds.includes(b.id))
  }
  return businessesStore.businesses
})

async function handleSearch() {
  showingFavorites.value = false // Exit favorites view when searching

  if (searchQuery.value.trim()) {
    // Search by query
    await businessesStore.search({
      search: searchQuery.value,
      limit: 50,
    })
  } else {
    // Load all businesses if search is empty
    await loadBusinesses()
  }
}

async function handleClear() {
  searchQuery.value = ''
  await loadBusinesses()
}

async function loadBusinesses() {
  // Load all businesses from database
  await businessesStore.search({
    limit: 100,
  })
}

onMounted(async () => {
  // Load user profile
  await profileStore.fetchProfile()

  // Load favorites list (just IDs, not businesses)
  await favoritesStore.loadFavorites()
})

function getFullAvatarUrl(avatarUrl: string | null): string {
  if (!avatarUrl) return ''
  // Remove /api/v1 from base URL and append avatar URL
  const baseUrl = API_BASE_URL.replace('/api/v1', '')
  return `${baseUrl}${avatarUrl}`
}

function getFullLogoUrl(logoUrl: string | null): string {
  if (!logoUrl) return ''
  // Remove /api/v1 from base URL and append logo URL
  const baseUrl = API_BASE_URL.replace('/api/v1', '')
  return `${baseUrl}${logoUrl}`
}

function selectBusiness(business: Business) {
  selectedBusiness.value = business
}

function selectBusinessById(businessId: number) {
  const business = businessesStore.businesses.find(b => b.id === businessId)
  if (business) {
    selectedBusiness.value = business
  }
}

function businessTypeLabel(type: BusinessType): string {
  const labels = {
    car_wash: 'Автомойка',
    auto_repair: 'Автосервис',
    tire_service: 'Шиномонтаж',
    beauty_salon: 'Салон красоты',
  }
  return labels[type] || type
}

function statusLabel(status: BusinessStatus): string {
  const labels = {
    available: 'Свободно',
    busy: 'Занято',
    very_busy: 'Очень загружено',
  }
  return labels[status] || status
}

function statusColor(status: BusinessStatus): string {
  const colors = {
    available: 'success',
    busy: 'warning',
    very_busy: 'danger',
  }
  return colors[status] || 'medium'
}

function call(phone: string, event?: Event) {
  if (event) {
    event.stopPropagation() // Prevent card click
  }
  window.location.href = `tel:${phone}`
}

function bookService(business: Business, event?: Event) {
  if (event) {
    event.stopPropagation() // Prevent card click
  }
  router.push(`/booking/business/${business.id}`)
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success':
      return checkmarkCircleOutline
    case 'warning':
      return alertCircleOutline
    case 'info':
    default:
      return informationCircleOutline
  }
}

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} мин назад`
  } else if (diffHours < 24) {
    return `${diffHours} ч назад`
  } else if (diffDays === 1) {
    return 'Вчера'
  } else if (diffDays < 7) {
    return `${diffDays} дн назад`
  } else {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }
}

function handleNotificationClick(notification: Notification) {
  // Mark as read
  notification.read = true

  // TODO: Handle notification action (navigate to booking details, etc.)
  console.log('Notification clicked:', notification)
}

function markAllAsRead() {
  notifications.value.forEach(n => n.read = true)
}

async function toggleFavorite(business: Business, event: Event) {
  event.stopPropagation() // Prevent card click

  if (favoritesStore.isFavorite(business.id)) {
    await favoritesStore.removeFromFavorites(business.id)
  } else {
    await favoritesStore.addToFavorites(business.id)
  }
}

function isFavorite(businessId: number): boolean {
  return favoritesStore.isFavorite(businessId)
}

async function toggleFavoritesView() {
  showingFavorites.value = !showingFavorites.value
  if (showingFavorites.value) {
    await favoritesStore.loadFavorites()
    // Load all businesses from database to ensure favorites are included
    await businessesStore.search({
      limit: 100,
    })
  }
}
</script>

<style scoped>
/* Header Container */
.custom-header {
  background: #f5f5f5;
  padding: 12px 16px;
  box-shadow: none !important;
}

.custom-header::after {
  display: none !important;
}

ion-header {
  box-shadow: none !important;
}

ion-header::after {
  display: none !important;
}

.header-toolbar {
  --background: #D6D6D6;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --border-width: 0 !important;
  --box-shadow: none !important;
  margin: 0;
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: none !important;
  border: none !important;
}

.header-toolbar::part(native) {
  border-radius: 16px !important;
  overflow: hidden !important;
}

.header-toolbar ion-buttons {
  margin-right: 0 !important;
  padding-right: 0 !important;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.profile-header:hover {
  opacity: 0.8;
}

.avatar-small {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(39, 18, 106, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--ion-color-primary);
}

.avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-small ion-icon {
  font-size: 40px;
  color: var(--ion-color-primary);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-name {
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

.profile-link {
  color: #1a1a1a;
  font-size: 12px;
  line-height: 1.2;
  opacity: 0.7;
}

/* Header Action Buttons - iOS Style */
.favorites-icon {
  font-size: 28px !important;
  color: var(--ion-color-primary) !important;
}

.notifications-button-wrapper {
  position: relative;
  display: inline-block;
}

.notifications-icon {
  font-size: 28px !important;
  color: var(--ion-color-primary) !important;
}

.notifications-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FF3B30;
  color: white;
  border: 2px solid #D6D6D6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.search-panel {
  padding: 8px 16px;
  background: var(--ion-background-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.custom-searchbar {
  --background: #ffffff;
  --border-radius: 12px;
  --box-shadow: 0 2px 12px rgba(138, 43, 226, 0.12);
  --placeholder-color: #92949c;
  --icon-color: #8A2BE2;
  --clear-button-color: #8A2BE2;
  padding: 0;
}

.custom-searchbar::part(icon) {
  color: var(--ion-color-primary);
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  padding: 24px;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin: 0;
}

.welcome-message {
  text-align: center;
  line-height: 1.6;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

.empty-state ion-icon {
  font-size: 64px;
}

/* Business List Container */
.business-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Modern Business Card */
.business-card-modern {
  margin: 0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.business-card-modern:hover {
  box-shadow: 0 4px 12px rgba(39, 18, 106, 0.15);
  transform: translateY(-2px);
}

.business-card-modern ion-card-content {
  padding: 20px;
}

.card-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  position: relative;
}

/* Business Logo */
.business-logo {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.business-logo img {
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
  font-size: 24px;
  font-weight: 600;
  color: var(--ion-color-primary);
  background: rgba(39, 18, 106, 0.1);
}

/* Business Content */
.business-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.business-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

.business-type-label {
  margin: 0;
  font-size: 15px;
  color: var(--ion-color-medium);
  line-height: 1.2;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

/* Business Meta */
.business-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.meta-row ion-icon {
  font-size: 18px;
  flex-shrink: 0;
  color: var(--ion-color-primary);
}

.meta-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Action Buttons */
.action-buttons {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-top: 12px;
  width: 100%;
}

.action-buttons ion-button {
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: fit-content;
}

.book-button {
  display: inline-block !important;
  --background: var(--ion-color-primary);
  --border-radius: 10px;
  --padding-start: 20px;
  --padding-end: 20px;
  height: 38px;
  font-weight: 600;
  font-size: 14px;
  text-transform: none;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
  margin: 0;
}

.book-button:hover {
  --background: rgba(39, 18, 106, 0.9);
}

.call-button {
  display: inline-block !important;
  --border-color: var(--ion-color-primary);
  --color: var(--ion-color-primary);
  --border-radius: 10px;
  --border-width: 2px;
  --padding-start: 20px;
  --padding-end: 20px;
  height: 38px;
  font-weight: 600;
  font-size: 14px;
  text-transform: none;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
  margin: 0;
}

.call-button:hover {
  --background: rgba(39, 18, 106, 0.05);
}

/* Favorite Button in Card */
.favorite-button-card {
  position: absolute;
  top: 0;
  right: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
}

.favorite-button-card ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.favorite-button-card .favorite-active {
  color: var(--ion-color-primary);
}

.modal-detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.modal-detail-row strong {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.modal-detail-row p {
  margin: 4px 0 0 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

/* Notifications Popover */
.notifications-popover {
  --width: 360px;
  --max-height: 500px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--ion-color-light);
}

.notifications-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.notifications-list {
  padding: 0;
}

.notifications-list ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  --min-height: 80px;
  border-bottom: 1px solid var(--ion-color-light);
}

.notifications-list ion-item.unread {
  --background: rgba(138, 43, 226, 0.05);
}

.notification-content {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 8px 0;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon ion-icon {
  font-size: 24px;
}

.notification-icon.type-success {
  background: rgba(45, 211, 111, 0.15);
  color: var(--ion-color-success);
}

.notification-icon.type-info {
  background: rgba(61, 194, 255, 0.15);
  color: var(--ion-color-secondary);
}

.notification-icon.type-warning {
  background: rgba(255, 196, 9, 0.15);
  color: var(--ion-color-warning);
}

.notification-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ion-color-dark);
  line-height: 1.3;
}

.notification-message {
  font-size: 14px;
  color: var(--ion-color-medium);
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 2px;
}

.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
}

.notifications-empty ion-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  opacity: 0.5;
}

.notifications-empty p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 16px;
}

</style>
