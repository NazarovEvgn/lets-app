import { defineStore } from 'pinia'
import { ref } from 'vue'
import { favoritesApiService } from '../services/favoritesApiService'
import type { Favorite } from '../types'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Favorite[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load user favorites
   */
  async function loadFavorites() {
    loading.value = true
    error.value = null

    try {
      favorites.value = await favoritesApiService.getMyFavorites()
    } catch (err: any) {
      console.error('[FavoritesStore] Error loading favorites:', err)
      error.value = err.response?.data?.detail || 'Failed to load favorites'
    } finally {
      loading.value = false
    }
  }

  /**
   * Add business to favorites
   */
  async function addToFavorites(businessId: number): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await favoritesApiService.addFavorite({ business_id: businessId })
      // Reload favorites to get updated list
      await loadFavorites()
      return true
    } catch (err: any) {
      console.error('[FavoritesStore] Error adding favorite:', err)
      error.value = err.response?.data?.detail || 'Failed to add to favorites'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove business from favorites
   */
  async function removeFromFavorites(businessId: number): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await favoritesApiService.removeFavorite(businessId)
      // Remove from local state
      favorites.value = favorites.value.filter(f => f.business_id !== businessId)
      return true
    } catch (err: any) {
      console.error('[FavoritesStore] Error removing favorite:', err)
      error.value = err.response?.data?.detail || 'Failed to remove from favorites'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if business is in favorites
   */
  function isFavorite(businessId: number): boolean {
    return favorites.value.some(f => f.business_id === businessId)
  }

  return {
    favorites,
    loading,
    error,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  }
})
