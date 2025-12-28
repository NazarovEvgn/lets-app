<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="router.back()">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Выбор даты</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-content">
        <h2 class="section-title">Выберите дату записи</h2>

        <div class="calendar-container">
          <ion-datetime
            v-model="selectedDate"
            presentation="date"
            :min="minDate"
            :max="maxDate"
            locale="ru-RU"
            :first-day-of-week="1"
            @ion-change="handleDateChange"
            class="custom-calendar"
          >
            <span slot="title">Выберите дату</span>
          </ion-datetime>
        </div>

        <div class="action-buttons">
          <ion-button
            expand="block"
            :disabled="!selectedDate"
            @click="proceedToTimeSelection"
            class="continue-button"
          >
            Продолжить
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonDatetime,
} from '@ionic/vue'
import { arrowBackOutline } from 'ionicons/icons'
import { useBookingStore } from '../stores/bookingStore'

const router = useRouter()
const route = useRoute()
const bookingStore = useBookingStore()

const businessId = ref<number>(parseInt(route.params.businessId as string))
const serviceId = ref<number>(parseInt(route.params.serviceId as string))
const employeeId = ref<number>(parseInt(route.params.employeeId as string))

const selectedDate = ref<string | null>(null)
const minDate = ref<string>('')
const maxDate = ref<string>('')

function handleDateChange(event: CustomEvent) {
  const value = event.detail.value
  if (value) {
    // Extract just the date part (YYYY-MM-DD)
    selectedDate.value = value.split('T')[0]
  }
}

function proceedToTimeSelection() {
  if (!selectedDate.value) return

  bookingStore.selectDate(selectedDate.value)
  router.push(`/booking/select-time/${businessId.value}/${serviceId.value}/${employeeId.value}`)
}

onMounted(() => {
  // Set min date to today
  const today = new Date()
  minDate.value = today.toISOString()

  // Set max date to 60 days from now
  const maxDateObj = new Date()
  maxDateObj.setDate(maxDateObj.getDate() + 60)
  maxDate.value = maxDateObj.toISOString()

  // Set default selected date to today
  selectedDate.value = today.toISOString().split('T')[0]
})
</script>

<style scoped>
ion-content {
  --background: #f5f5f5;
}

.page-content {
  padding: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
  text-align: center;
}

.calendar-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.custom-calendar {
  --background: #ffffff;
  --ion-color-primary: #27126A;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

.action-buttons {
  padding: 0 8px;
}

.continue-button {
  --background: var(--ion-color-primary);
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
  font-size: 16px;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}
</style>
