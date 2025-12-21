export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface PhoneOTPRequest {
  phone: string
}

export interface OTPVerifyRequest {
  phone: string
  code: string
}

export interface BusinessLoginRequest {
  email: string
  password: string
}

export interface OTPResponse {
  success: boolean
  message: string
  phone: string
  debug_code?: string // MVP only
}
