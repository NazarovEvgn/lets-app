import axios from 'axios'
import type { Business, BusinessUpdateInput } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const profileApiService = {
  /**
   * Get current business profile
   */
  async getProfile(): Promise<Business> {
    const response = await axios.get<Business>(`${API_BASE_URL}/admin/business/profile`)
    return response.data
  },

  /**
   * Update business profile
   */
  async updateProfile(data: BusinessUpdateInput): Promise<Business> {
    const response = await axios.put<Business>(`${API_BASE_URL}/admin/business/profile`, data)
    return response.data
  },
}
