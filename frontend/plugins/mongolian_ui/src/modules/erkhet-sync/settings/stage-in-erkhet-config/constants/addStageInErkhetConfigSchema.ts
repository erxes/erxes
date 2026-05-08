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
  anotherRulesOfProductsOnCitytax: z.string(),
  anotherRulesOfProductsOnVat: z.string(),
  defaultPay: z.string().min(1, 'Default pay is required'),
  нэхэмжлэх: z.string().optional().default(''),
  хаанБанкданс: z.string().optional().default(''),
  голомтБанкданс: z.string().optional().default(''),
  barter: z.string().optional().default(''),
  paymentTypes: z.record(z.string(), z.string()).optional(),
});
