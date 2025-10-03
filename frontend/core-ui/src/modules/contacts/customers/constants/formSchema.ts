import { z } from "zod";

export const customerFormSchema = z.object({
  state: z.string().default(""),
  avatar: z.string().nullable().default(null),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().default(''),
  middleName: z.string().default(''),
  sex: z.number().nullable().default(null),
  primaryEmail: z.string().email("Invalid email format"),
  primaryPhone: z.string().default(''),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string().email()).default([]),
  ownerId: z.string().default(''),
  description: z.string().default(''),
  isSubscribed: z.string().default('Yes'),
  links: z.any().default({}),
  code: z.string().default(''),
  emailValidationStatus: z.string().default('unknown'),
  phoneValidationStatus: z.string().default('unknown'),
});

export type CustomerFormType = z.infer<typeof customerFormSchema>;
