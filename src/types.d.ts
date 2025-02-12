export interface Trajectory {
  trajNumber: number
  personId: number
  sourceId: string
  targetId: string
  movingDate: string
  dataAccuracy: string
  trajectoryType?: string
}

export interface Place {
  id: string
  name: string
  type: string
  lat: number
  lng: number
  accuracy: string
  distance: number | string
}

export interface Settings {
  personId: string
  exponent: string
}
