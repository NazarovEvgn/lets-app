import apiClient from '@/core/api/client'
import type { Business } from '@/features/businesses/types'
import type { Service, Employee } from '@/features/businesses/types'
import type { BookingRequest, Booking, AvailableSlot } from '../types'

export const bookingApiService = {
  /**
   * Get business details by ID
   */
  async getBusinessById(businessId: number): Promise<Business> {
    const response = await apiClient.get(`/businesses/${businessId}`)
    return response.data
  },

  /**
   * Get all services for a business
   */
  async getBusinessServices(businessId: number): Promise<Service[]> {
    // TODO: Update endpoint when backend is ready
    const response = await apiClient.get(`/admin/services?business_id=${businessId}`)
    return response.data
  },

  /**
   * Get all employees for a business (filtered by service if provided)
   */
  async getBusinessEmployees(businessId: number, serviceId?: number): Promise<Employee[]> {
    // TODO: Update endpoint when backend is ready
    let url = `/admin/employees?business_id=${businessId}`
    if (serviceId) {
      url += `&service_id=${serviceId}`
    }
    const response = await apiClient.get(url)
    return response.data
  },

  /**
   * Get available time slots for employee on specific date
   */
  async getAvailableSlots(employeeId: number, date: string, serviceId: number): Promise<AvailableSlot[]> {
    // TODO: Implement when backend endpoint is ready
    const response = await apiClient.get(`/bookings/available-slots`, {
      params: {
        employee_id: employeeId,
        date,
        service_id: serviceId,
      },
    })
    return response.data
  },

  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    const response = await apiClient.post('/bookings', bookingData)
    return response.data
  },

  /**
   * Get client's bookings
   */
  async getMyBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/bookings/my')
    return response.data
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: number): Promise<void> {
    await apiClient.delete(`/bookings/${bookingId}`)
  },
}
