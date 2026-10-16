import { z } from 'zod';

export const TECH_CARD_DURATION_TYPES = [
  'real',
  'minut',
  'hour',
  'day',
] as const;
const durationTypeSchema = z.enum(TECH_CARD_DURATION_TYPES);

export const normalizeTechCardDurationType = (value?: string) => {
  if (!value || value === 'минут') return 'minut' as const;
  return durationTypeSchema.safeParse(value).data ?? 'minut';
};

const itemSchema = z.object({
  productId: z.string().min(1, 'Бараа сонгоно уу'),
  uom: z.string().optional(),
  quantity: z.number().positive('Тоо хэмжээ 0-ээс их байх ёстой'),
  costRatio: z.number().finite().min(0).optional(),
});

const costSchema = z.object({
  name: z.string().trim().min(1, 'Зардлын нэр оруулна уу'),
  amount: z.number().finite().min(0, 'Дүн 0-ээс багагүй байна'),
  accountId: z.string().trim().min(1, 'Бичилт хийх данс сонгоно уу'),
});

export const techCardFormSchema = z
  .object({
    code: z.string().optional(),
    name: z.string().min(1, 'Нэр оруулна уу'),
    description: z.string().optional(),
    duration: z.number().min(0).optional(),
    durationType: durationTypeSchema,
    laborCosts: z.array(costSchema),
    overheadCosts: z.array(costSchema),
    inputs: z.array(itemSchema).min(1, 'Орц бараа нэмнэ үү'),
    outputs: z.array(itemSchema).min(1, 'Гарц бараа нэмнэ үү'),
    status: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.durationType !== 'real' && data.duration === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['duration'],
        message: 'Үргэлжлэх хугацаа оруулна уу',
      });
    }
    const totalCostRatio = data.outputs.reduce(
      (sum, item) => sum + (item.costRatio ?? 0),
      0,
    );

    if (!Number.isFinite(totalCostRatio) || totalCostRatio <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['outputs'],
        message: 'Гарцын өртгийн харьцааны нийлбэр 0-ээс их байх ёстой',
      });
    }
  })
  .transform((data) => ({
    ...data,
    duration: data.durationType === 'real' ? undefined : data.duration,
  }));
