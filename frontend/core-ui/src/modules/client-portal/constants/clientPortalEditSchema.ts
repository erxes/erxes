import { z } from 'zod';

export const CLIENTPORTAL_EDIT_SCHEMA = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  domain: z.string().url(),
});

export const CLIENTPORTAL_TEST_SCHEMA = z.object({
  testUserEmail: z.string().email(),
  testUserPhone: z.string().optional(),
  testUserPassword: z.string().optional(),
  testUserOTP: z.string().min(4).max(6).regex(/^\d+$/).optional(),
});

export const CLIENTPORTAL_OTP_SCHEMA = z.object({
  smsConfig: z.string().optional(),
  emailSubject: z.string().optional(),
  content: z.string().optional(),
  codeLength: z.number().min(4).max(6).optional(),
  expireAfter: z.number().min(1).optional(),
  twoFactorEnabled: z.boolean().optional(),
});
