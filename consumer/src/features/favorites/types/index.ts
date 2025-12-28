export interface Favorite {
  id: number
  business_id: number
  business_name: string
  business_type: string
}

export interface FavoriteCreate {
  business_id: number
}
