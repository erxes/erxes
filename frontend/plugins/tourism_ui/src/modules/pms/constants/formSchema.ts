import { z } from 'zod';

export const PmsBranchFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(50).optional(),
  checkInTime: z.string().min(1, 'Check in time is required'),
  checkInAmount: z.coerce.number(),
  checkOutTime: z.string().min(1, 'Check out time is required'),
  checkOutAmount: z.coerce.number(),
  discounts: z.array(
    z.object({
      type: z.string().optional(),
      title: z.string().optional(),
      icon: z.string().optional(),
      config: z.string().optional(),
    }),
  ),
  websiteReservationLock: z.boolean(),
  time: z.string().optional(),
  paymentIds: z.array(z.string()).optional(),
  paymentTypes: z.array(z.any()).optional(),
  erxesAppToken: z.string().optional(),
  otherPayments: z
    .array(
      z.object({
        type: z.string().optional(),
        title: z.string().optional(),
        icon: z.string().optional(),
        config: z.string().optional(),
      }),
    )
    .optional(),
  user1Ids: z.array(z.string()).optional(),
  user2Ids: z.array(z.string()).optional(),
  user3Ids: z.array(z.string()).optional(),
  user4Ids: z.array(z.string()).optional(),
  user5Ids: z.array(z.string()).optional(),
  departmentId: z.string().optional(),
  permissionConfig: z.any().optional(),
  uiOptions: z.any().optional(),
  pipelineConfig: z.any().optional(),
  extraProductCategories: z.array(z.any()).optional(),
  roomCategories: z.array(z.any()).optional(),
  logo: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  thirdColor: z.string().optional(),
  website: z.string().optional(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  roomsCategoryId: z.string().optional(),
  extrasCategoryId: z.string().optional(),
  discount: z.any().optional(),
});

export type PmsBranchFormType = z.infer<typeof PmsBranchFormSchema>;
