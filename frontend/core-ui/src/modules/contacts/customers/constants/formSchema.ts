import { z } from "zod";

export const customerFormSchema = z.object({
  state: z.string().default(""),
  avatar: z.string().nullable().default(null),
  firstName: z.string().default(''),
  lastName: z.string().default(''),
  middleName: z.string().default(''),
  sex: z.number().nullable().default(null),
  primaryEmail: z.union([z.literal(''), z.string().email("Invalid email format")]).default(''),
  primaryPhone: z.string().default(''),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.union([z.literal(''), z.string().email()])).default([]),
  ownerId: z.string().default(''),
  description: z.string().default(''),
  isSubscribed: z.string().default('Yes'),
  links: z.any().default({}),
  code: z.string().default(''),
  emailValidationStatus: z.string().default('unknown'),
  phoneValidationStatus: z.string().default('unknown'),
});

export type CustomerFormType = z.infer<typeof customerFormSchema>;
