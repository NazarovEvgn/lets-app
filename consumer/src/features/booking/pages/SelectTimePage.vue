<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="router.back()">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Выбор времени</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-content">
        <!-- Horizontal Date Picker -->
        <div class="horizontal-date-picker">
          <div class="date-scroll-container" ref="dateScrollContainer">
            <div class="dates-wrapper" ref="datesWrapper">
              <div
                v-for="dateObj in availableDates"
                :key="dateObj.dateString"
                class="date-item"
                :class="{ 'date-item-selected': dateObj.dateString === selectedDate }"
                @click="selectDate(dateObj.dateString)"
              >
                <div class="date-day">{{ dateObj.dayName }}</div>
                <div class="date-number">{{ dateObj.dayNumber }}</div>
                <div class="date-month">{{ dateObj.monthName }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Slots Section -->
        <div class="time-slots-section">
          <h2 class="section-title">Доступное время</h2>

          <!-- Loading -->
          <div v-if="loadingSlots" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <!-- Time Slots Grid -->
          <div v-else-if="timeSlots.length > 0" class="time-slots-grid">
            <div
              v-for="slot in timeSlots"
              :key="slot.time"
              class="time-slot"
              :class="{ 'time-slot-selected': slot.time === selectedTime }"
              @click="selectTime(slot.time)"
            >
              {{ slot.time }}
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <p>Нет доступных слотов на выбранную дату</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            :disabled="!selectedTime"
            @click="confirmBooking"
            class="confirm-button"
          >
            Подтвердить запись
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
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
  IonSpinner,
  alertController,
} from '@ionic/vue'
import { arrowBackOutline } from 'ionicons/icons'
import { useBookingStore } from '../stores/bookingStore'
import type { TimeSlot } from '../types'

const router = useRouter()
const route = useRoute()
const bookingStore = useBookingStore()

const businessId = ref<number>(parseInt(route.params.businessId as string))
const serviceId = ref<number>(parseInt(route.params.serviceId as string))
const employeeId = ref<number>(parseInt(route.params.employeeId as string))

const selectedDate = ref<string>(bookingStore.selectedDate || '')
const selectedTime = ref<string | null>(null)
const timeSlots = ref<TimeSlot[]>([])
const loadingSlots = ref(false)

const dateScrollContainer = ref<HTMLElement | null>(null)
const datesWrapper = ref<HTMLElement | null>(null)

interface DateObject {
  dateString: string
  dayName: string
  dayNumber: string
  monthName: string
  date: Date
}

const availableDates = ref<DateObject[]>([])

// Generate available dates (14 days starting from selected date or today)
function generateAvailableDates() {
  const dates: DateObject[] = []
  const startDate = selectedDate.value ? new Date(selectedDate.value) : new Date()

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const dateString = date.toISOString().split('T')[0]

    dates.push({
      dateString,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate().toString(),
      monthName: monthNames[date.getMonth()],
      date,
    })
  }

  availableDates.value = dates

  // Set initial selected date if not set
  if (!selectedDate.value) {
    selectedDate.value = dates[0].dateString
  }
}

// Select date
async function selectDate(dateString: string) {
  selectedDate.value = dateString
  selectedTime.value = null
  bookingStore.selectDate(dateString)

  await loadTimeSlots()

  // Scroll to selected date
  await nextTick()
  scrollToSelectedDate()
}

// Scroll to selected date in horizontal picker
function scrollToSelectedDate() {
  if (!dateScrollContainer.value) return

  const selectedElement = dateScrollContainer.value.querySelector('.date-item-selected') as HTMLElement
  if (!selectedElement) return

  const container = dateScrollContainer.value
  const elementLeft = selectedElement.offsetLeft
  const elementWidth = selectedElement.offsetWidth
  const containerWidth = container.offsetWidth

  // Calculate scroll position to center the selected date
  const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2)

  container.scrollTo({
    left: scrollLeft,
    behavior: 'smooth',
  })
}

// Load time slots for selected date
async function loadTimeSlots() {
  if (!selectedDate.value) return

  loadingSlots.value = true

  try {
    await bookingStore.fetchAvailableSlots(employeeId.value, selectedDate.value)

    // Convert available slots to time slots
    const slots = bookingStore.availableSlots.filter(s => s.date === selectedDate.value)
    timeSlots.value = slots.map(s => ({
      time: s.time,
      available: true,
      employee_id: s.employee_id,
    }))
  } catch (err) {
    console.error('[SelectTimePage] Error loading time slots:', err)
  } finally {
    loadingSlots.value = false
  }
}

// Select time
function selectTime(time: string) {
  selectedTime.value = time
  bookingStore.selectTime(time)
}

// Confirm booking
async function confirmBooking() {
  if (!selectedTime.value) return

  const success = await bookingStore.submitBooking()

  if (success) {
    const alert = await alertController.create({
      header: 'Запись подтверждена',
      message: `Вы записаны на ${selectedDate.value} в ${selectedTime.value}`,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            router.push('/home')
          },
        },
      ],
    })

    await alert.present()
  } else {
    const alert = await alertController.create({
      header: 'Ошибка',
      message: bookingStore.error || 'Не удалось создать запись',
      buttons: ['OK'],
    })

    await alert.present()
  }
}

onMounted(async () => {
  generateAvailableDates()
  await loadTimeSlots()

  // Scroll to selected date after mounting
  await nextTick()
  scrollToSelectedDate()
})
</script>

<style scoped>
ion-content {
  --background: #f5f5f5;
}

.page-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Horizontal Date Picker */
.horizontal-date-picker {
  background: #ffffff;
  padding: 16px 0;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.date-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.date-scroll-container::-webkit-scrollbar {
  display: none;
}

.dates-wrapper {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  min-width: min-content;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 80px;
  padding: 8px;
  border-radius: 12px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

.date-item:active {
  transform: scale(0.95);
}

.date-item-selected {
  background: var(--ion-color-primary);
  color: #ffffff;
}

.date-day {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: 4px;
}

.date-number {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.date-month {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
}

.date-item-selected .date-day,
.date-item-selected .date-number,
.date-item-selected .date-month {
  opacity: 1;
}

/* Time Slots Section */
.time-slots-section {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 24px;
}

.time-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 8px;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

.time-slot:active {
  transform: scale(0.95);
}

.time-slot-selected {
  background: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
  color: #ffffff;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}

/* Action Buttons */
.action-buttons {
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.confirm-button {
  --background: var(--ion-color-primary);
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
  font-size: 16px;
  font-family: 'Tilda Sans', -apple-system, system-ui, sans-serif;
}
</style>
