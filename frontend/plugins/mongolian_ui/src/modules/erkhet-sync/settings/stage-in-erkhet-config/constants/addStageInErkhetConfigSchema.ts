import { z } from 'zod';

export const addStageInErkhetConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  boardId: z.string().min(1, 'Destination stage board is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  stageId: z.string().min(1, 'Stage is required'),
  userEmail: z.string().min(1, 'User email is required'),
  chooseResponseField: z.string().min(1, 'Choose response field is required'),
  hasVat: z.boolean(),
  hasCityTax: z.boolean(),
  anotherRulesOfProductsOnCitytax: z
    .string()
    .min(1, 'Another rules of products on citytax is required'),
  anotherRulesOfProductsOnVat: z
    .string()
    .min(1, 'Another rules of products on VAT is required'),
  defaultPay: z.string().min(1, 'Default pay is required'),
  нэхэмжлэх: z.string().min(1, 'Нэхэмжлэх is required'),
  хаанБанкданс: z.string().min(1, 'Хаан банкданс is required'),
  голомтБанкданс: z.string().min(1, 'Голомт банкданс is required'),
  barter: z.string().min(1, 'Barter is required'),
});
