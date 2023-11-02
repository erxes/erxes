import { IUser } from "../auth/types"
import { IAttachment } from "../types"

export interface IAbsence {
  _id: string
  user: IUser
  startTime: Date
  endTime: Date
  holidayName: string
  reason: string
  explanation: string
  solved: boolean
  status: string
  attachment: IAttachment

  absenceTimeType: string
  requestDates: string[]
  totalHoursOfAbsence: string

  note?: string

  absenceType?: string
}
