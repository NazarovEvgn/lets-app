export interface Service {
  id: number
  business_id: number
  name: string
  description?: string
  price_from: number
  price_to: number
  duration_minutes: number
  photo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
