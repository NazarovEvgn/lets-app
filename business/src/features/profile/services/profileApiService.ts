import { apiClient } from '@/core/api/client'
import type { Business, BusinessUpdateInput } from '../types'

export const profileApiService = {
  /**
   * Get current business profile
   */
  async getProfile(): Promise<Business> {
    const response = await apiClient.get<any>('/admin/business/profile')
    // Transform backend 'type' field to frontend 'business_type'
    const { type, ...rest } = response.data
    return {
      ...rest,
      business_type: type,
    }
  },

  /**
   * Update business profile
   */
  async updateProfile(data: BusinessUpdateInput): Promise<Business> {
    // Transform business_type to type for backend
    const { business_type, ...rest } = data
    const payload = {
      ...rest,
      type: business_type,
    }
    const response = await apiClient.patch<any>('/admin/business/profile', payload)
    // Transform backend 'type' field to frontend 'business_type'
    const { type, ...restResponse } = response.data
    return {
      ...restResponse,
      business_type: type,
    }
  },
}
