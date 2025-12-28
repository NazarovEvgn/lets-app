export interface Employee {
  id: number
  business_id: number
  name: string
  phone?: string
  photo_url?: string
  is_active: boolean
  service_ids: number[]
  created_at: string
  updated_at: string
}
