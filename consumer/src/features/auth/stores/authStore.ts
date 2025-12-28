import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApiService } from '../services/authApiService'
import type { PhoneOTPRequest, OTPVerifyRequest, BusinessLoginRequest } from '../types'
import apiClient from '@/core/api/client'

interface User {
  id: number
  email: string | null
  phone: string
  name: string | null
  gender: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const userType = ref<'client' | 'business_admin' | null>(
    localStorage.getItem('user_type') as 'client' | 'business_admin' | null
  )
  const user = ref<User | null>(null)

  const isAuthenticated = ref(!!accessToken.value)

  async function fetchUserProfile(): Promise<void> {
    try {
      const response = await apiClient.get<User>('/profile/me')
      user.value = response.data
      console.log('[AuthStore] User profile loaded:', user.value)
    } catch (err: any) {
      console.error('[AuthStore] Failed to fetch user profile:', err)
      user.value = null
    }
  }

  async function devLogin(data: PhoneOTPRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const tokens = await authApiService.devLogin(data)

      accessToken.value = tokens.access_token
      refreshToken.value = tokens.refresh_token
      userType.value = 'client'
      isAuthenticated.value = true

      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      localStorage.setItem('user_type', 'client')

      // Load user profile after successful login
      await fetchUserProfile()

      return { success: true }
    } catch (err: any) {
      console.error('[AuthStore] devLogin error:', err)
      return {
        success: false,
        error: err.response?.data?.detail || 'Login failed'
      }
    }
  }

  async function sendOTP(data: PhoneOTPRequest): Promise<{ success: boolean; error?: string; debugCode?: string }> {
    try {
      const result = await authApiService.sendOTP(data)
      return {
        success: true,
        debugCode: result.debug_code, // MVP only
      }
    } catch (err: any) {
      console.error('[AuthStore] sendOTP error:', err)
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to send OTP'
      }
    }
  }

  async function verifyOTP(data: OTPVerifyRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const tokens = await authApiService.verifyOTP(data)

      accessToken.value = tokens.access_token
      refreshToken.value = tokens.refresh_token
      userType.value = 'client'
      isAuthenticated.value = true

      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      localStorage.setItem('user_type', 'client')

      // Load user profile after successful login
      await fetchUserProfile()

      return { success: true }
    } catch (err: any) {
      console.error('[AuthStore] verifyOTP error:', err)
      return {
        success: false,
        error: err.response?.data?.detail || 'Invalid OTP code'
      }
    }
  }

  async function loginBusiness(data: BusinessLoginRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const tokens = await authApiService.loginBusiness(data)

      accessToken.value = tokens.access_token
      refreshToken.value = tokens.refresh_token
      userType.value = 'business_admin'
      isAuthenticated.value = true

      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      localStorage.setItem('user_type', 'business_admin')

      return { success: true }
    } catch (err: any) {
      console.error('[AuthStore] loginBusiness error:', err)
      return {
        success: false,
        error: err.response?.data?.detail || 'Invalid credentials'
      }
    }
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    userType.value = null
    user.value = null
    isAuthenticated.value = false

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_type')
  }

  return {
    accessToken,
    refreshToken,
    userType,
    user,
    isAuthenticated,
    devLogin,
    sendOTP,
    verifyOTP,
    loginBusiness,
    logout,
    fetchUserProfile,
  }
})
