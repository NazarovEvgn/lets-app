import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bookingsApiService } from '../services/bookingsApiService'
import type { Booking, BookingFilters, BookingStatus } from '../types'

export const useBookingsStore = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed: количество неотработанных записей (pending + confirmed)
  const activeBookingsCount = computed(() => {
    return bookings.value.filter(
      (b) => b.status === 'pending' || b.status === 'confirmed'
    ).length
  })

  async function fetchBookings(filters?: BookingFilters): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const data = await bookingsApiService.getAll(filters)
      bookings.value = data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch bookings'
      console.error('[BookingsStore] fetchBookings error:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateBookingStatus(
    id: number,
    status: BookingStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updated = await bookingsApiService.updateStatus(id, { status })
      const index = bookings.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bookings.value[index] = updated
      }
      return { success: true }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update booking status'
      console.error('[BookingsStore] updateBookingStatus error:', err)
      return { success: false, error: errorMessage }
    }
  }

  return {
    bookings,
    loading,
    error,
    activeBookingsCount,
    fetchBookings,
    updateBookingStatus,
  }
})
