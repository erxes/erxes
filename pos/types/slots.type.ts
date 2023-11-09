export interface ISlot {
  _id: string
  code: string
  name: string
  isPreDates: { dueDate: string; _id: string }[]
  option: {
    width: number
    height: number
    top: number
    left: number
    rotateAngle: number
    borderRadius: number
    color: string
    zIndex: string
    isShape: boolean
  }
}
