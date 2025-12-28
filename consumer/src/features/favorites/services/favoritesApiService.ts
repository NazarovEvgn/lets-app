import { apiClient } from '@/core/api/client'
import type { Favorite, FavoriteCreate } from '../types'

export const favoritesApiService = {
  /**
   * Get my favorites
   */
  async getMyFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<Favorite[]>('/favorites/my')
    return response.data
  },

  /**
   * Add to favorites
   */
  async addFavorite(data: FavoriteCreate): Promise<{ success: boolean; message: string; favorite_id: number }> {
    const response = await apiClient.post<{ success: boolean; message: string; favorite_id: number }>('/favorites', data)
    return response.data
  },

  /**
   * Remove from favorites by business_id
   */
  async removeFavorite(businessId: number): Promise<void> {
    await apiClient.delete(`/favorites/business/${businessId}`)
  },
}
