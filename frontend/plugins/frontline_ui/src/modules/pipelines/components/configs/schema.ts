import { z } from 'zod';

const companyFieldsSchema = z
  .object({
    isShowAddress: z.boolean().nullable().optional(),
    isShowEmail: z.boolean().nullable().optional(),
    isShowName: z.boolean().nullable().optional(),
    isShowPhoneNumber: z.boolean().nullable().optional(),
    isShowRegistrationNumber: z.boolean().nullable().optional(),
  })
  .nullable()
  .optional();

const customerFieldsSchema = z
  .object({
    isShowEmail: z.boolean().nullable().optional(),
    isShowFirstName: z.boolean().nullable().optional(),
    isShowLastName: z.boolean().nullable().optional(),
    isShowPhoneNumber: z.boolean().nullable().optional(),
  })
  .nullable()
  .optional();

const ticketBasicFieldsSchema = z
  .object({
    isShowAttachment: z.boolean().nullable(),
    isShowDescription: z.boolean().nullable(),
    isShowName: z.boolean().nullable(),
    isShowTags: z.boolean().nullable(),
  })
  .nullable()
  .optional();

export const PIPELINE_CONFIG_SCHEMA = z
  .object({
    name: z.string().min(1, 'Name is required'),
    channelId: z.string().min(1, 'Channel is required'),
    company: companyFieldsSchema,
    contactType: z.enum(['customer', 'company']).nullable(),
    pipelineId: z.string().min(1, 'Pipeline is required'),
    selectedStatusId: z.string().min(1, 'Status is required'),
    ticketBasicFields: ticketBasicFieldsSchema,
    customer: customerFieldsSchema,
  })
  .superRefine((data, ctx) => {
    const { contactType, company, customer } = data;

    if (contactType === 'customer') {
      // Validate customer fields when contactType is customer
      const customerResult = customerFieldsSchema.safeParse(customer);
      if (!customerResult.success) {
        customerResult.error.errors.forEach((err) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customer', ...err.path],
            message: err.message,
          });
        });
      }
    } else if (contactType === 'company') {
      // Validate company fields when contactType is company
      const companyResult = companyFieldsSchema.safeParse(company);
      if (!companyResult.success) {
        companyResult.error.errors.forEach((err) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['company', ...err.path],
            message: err.message,
          });
        });
      }
    }
  });
