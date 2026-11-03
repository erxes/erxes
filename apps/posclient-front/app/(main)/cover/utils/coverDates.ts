import { z } from "zod"

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export const getCoverEndDate = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number)
  const end = new Date(date)
  end.setHours(hours, minutes, 0, 0)
  return end
}

export const createCoverDatesSchema = (now: () => Date = () => new Date()) =>
  z
    .object({
      endDate: z.date({
        required_error: "Хаалт дуусах огноог сонгоно уу",
      }),
      time: z
        .string({ required_error: "Хаалт дуусах цагийг сонгоно уу" })
        .regex(timePattern, "Хаалт дуусах цагийг зөв оруулна уу"),
    })
    .superRefine(({ endDate, time }, context) => {
      if (timePattern.test(time) && getCoverEndDate(endDate, time) > now()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["time"],
          message:
            "Хаалт дуусах огноо, цаг одоогийн мөчөөс хэтрэхгүй байх ёстой",
        })
      }
    })
