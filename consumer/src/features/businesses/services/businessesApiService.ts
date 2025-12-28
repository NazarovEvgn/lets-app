import { apiClient } from '@/core/api/client'
import type { Business, NearbyBusinessesParams, SearchBusinessesParams } from '../types'

export const businessesApiService = {
  /**
   * Search businesses by query
   */
  async search(params: SearchBusinessesParams): Promise<Business[]> {
    const response = await apiClient.get<Business[]>('/businesses', { params })
    return response.data
  },

  /**
   * Get nearby businesses
   */
  async getNearby(params: NearbyBusinessesParams): Promise<Business[]> {
    const response = await apiClient.get<Business[]>('/businesses/nearby', { params })
    return response.data
  },

  /**
   * Get business by ID
   */
  async getById(id: number): Promise<Business> {
    const response = await apiClient.get<Business>(`/businesses/${id}`)
    return response.data
  },
}
