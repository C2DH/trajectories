export interface Trajectory {
  trajNumber: number
  personId: string
  sourceId: string
  targetId: string
  movingDate: string
  dataAccuracy: string
  trajectoryType?: string
}

export interface Legend {
  personId: string
  name: string
  yearSpan: string
  title: string
  description: string
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

export interface OffsettedPosition {
  item: Place
  x: number
  y: number
  yOriginal: number
  xOriginal: number
}

export interface Settings {
  personId: string
  exponent: string
}
