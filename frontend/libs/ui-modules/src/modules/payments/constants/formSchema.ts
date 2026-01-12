import { z } from 'zod';

export const PmsBranchFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(50).optional(),
  checkInTime: z.string(),
  checkInAmount: z.number(),
  checkOutTime: z.string(),
  checkOutAmount: z.number(),
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
  generalManagerIds: z.array(z.string()).optional(),
  managerIds: z.array(z.string()).optional(),
  reservationManagerIds: z.array(z.string()).optional(),
  receptionIds: z.array(z.string()).optional(),
  housekeeperIds: z.array(z.string()).optional(),
  logo: z.string().optional(),
  color: z.string().optional(),
  website: z.string().optional(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  roomsCategoryId: z.string().optional(),
  extrasCategoryId: z.string().optional(),
});

export type PmsBranchFormType = z.infer<typeof PmsBranchFormSchema>;
