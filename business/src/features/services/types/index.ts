export interface Service {
  id: number
  business_id: number
  name: string
  description: string | null
  price_from: number
  price_to: number
  duration_minutes: number
  photo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceCreateInput {
  name: string
  description?: string
  price_from: number
  price_to: number
  duration_minutes: number
  is_active: boolean
}

export interface ServiceUpdateInput {
  name?: string
  description?: string
  price_from?: number
  price_to?: number
  duration_minutes?: number
  is_active?: boolean
}

export interface ServiceFormData {
  name: string
  description: string
  price_from: number
  price_to: number
  duration_minutes: number
  is_active: boolean
}
