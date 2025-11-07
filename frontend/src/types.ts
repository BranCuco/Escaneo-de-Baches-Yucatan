export interface Location {
  lat: number
  lng: number
}

export interface Report {
  id: string
  description: string
  severity: string
  location?: Location | null
  photo?: string | null
  createdAt: string
}

export interface Auth {
  token: string
  user: string
}
