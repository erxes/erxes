import { z } from 'zod';

export const PIPELINE_CREATE_SCHEMA = z.object({
  name: z.string(),
  visibility: z.string(),
  boardId: z.string(),
  tagId: z.string().optional(),
  departmentIds: z.array(z.string()).optional(),
  branchIds: z.array(z.string()).optional(),
  memberIds: z.array(z.string()).optional(),
  numberConfig: z.string().optional(),
  numberSize: z.string().optional(),
  nameConfig: z.string().optional(),
  isCheckDate: z.boolean().optional(),
  isCheckUser: z.boolean().optional(),
  isCheckDepartment: z.boolean().optional(),
  excludeCheckUserIds: z.array(z.string()).optional(),
  initialCategoryIds: z.array(z.string()).optional(),
  excludeCategoryIds: z.array(z.string()).optional(),
  excludeProductIds: z.array(z.string()).optional(),
  erxesAppToken: z.string().optional(),
  paymentIds: z.array(z.string()).optional(),
  paymentTypes: z.array(z.string()).optional(),
  payment: z.string().optional().default(''),
  token: z.string().optional().default(''),
  otherPayments: z
    .array(
      z.object({
        type: z.string().min(1, 'Type is required'),
        title: z.string().min(1, 'Title is required'),
        icon: z.string().min(1, 'Icon is required'),
        config: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  stages: z
    .array(
      z.object({
        _id: z.string(),
        age: z.number().optional(),
        code: z.string().optional(),
        type: z.string().optional(),
        canMoveMemberIds: z.array(z.string()).optional(),
        canEditMemberIds: z.array(z.string()).optional(),
        name: z.string(),
        probability: z.string(),
        status: z.string().optional(),
        visibility: z.string().optional(),
      }),
    )
    .optional(),
});
