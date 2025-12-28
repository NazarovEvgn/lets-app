export interface TimeSlot {
  time: string // "09:00", "09:30", etc.
  available: boolean
  employee_id?: number
}

export interface AvailableSlot {
  date: string // "2025-01-15"
  time: string // "09:00"
  employee_id: number
  service_id: number
}

export interface BookingRequest {
  business_id: number
  service_id: number
  employee_id: number
  date: string // "2025-01-15"
  time: string // "09:00"
  notes?: string
}

export interface Booking {
  id: number
  business_id: number
  client_id: number
  service_id: number
  employee_id: number
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface BookingState {
  selectedBusinessId: number | null
  selectedServiceId: number | null
  selectedEmployeeId: number | null
  selectedDate: string | null
  selectedTime: string | null
}
