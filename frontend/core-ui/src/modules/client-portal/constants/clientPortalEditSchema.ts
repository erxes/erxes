import { z } from 'zod';

export const CLIENTPORTAL_EDIT_SCHEMA = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  domain: z.string().url(),
});

export const CLIENTPORTAL_AUTH_SCHEMA = z.object({
  tokenPassMethod: z.enum(['cookie', 'header']),
  tokenExpiration: z.number().min(1).max(7),
  refreshTokenExpiration: z.number().min(1).max(7),
});

export const CLIENTPORTAL_TEST_SCHEMA = z.object({
  testUserEnabled: z.boolean().optional(),
  testUserEmail: z.string().email(),
  testUserPhone: z.string().optional(),
  testUserPassword: z.string().optional(),
  testUserOTP: z
    .string()
    .regex(/^\d+$/, 'OTP must be a number')
    .min(4)
    .max(6)
    .optional(),
});

export const CLIENTPORTAL_OTP_SCHEMA = z.object({
  email: z
    .object({
      emailSubject: z.string().optional(),
      messageTemplate: z.string().optional(),
      codeLength: z.number().min(4).max(6).optional(),
      duration: z.number().min(1).optional(),
      enableEmailVerification: z.boolean().optional(),
      enablePasswordlessLogin: z.boolean().optional(),
    })
    .optional(),
  sms: z
    .object({
      smsProvider: z.string().optional(),
      messageTemplate: z.string().optional(),
      codeLength: z.number().min(4).max(6).optional(),
      duration: z.number().min(1).optional(),
      enablePhoneVerification: z.boolean().optional(),
      enablePasswordlessLogin: z.boolean().optional(),
    })
    .optional(),
});

export const CLIENTPORTAL_OTP_RESEND_SCHEMA = z.object({
  cooldownPeriodInSeconds: z.number().min(1).optional(),
  maxAttemptsPerHour: z.number().min(1).optional(),
});

export const CLIENTPORTAL_2FA_SCHEMA = z.object({
  email: z
    .object({
      emailSubject: z.string().optional(),
      messageTemplate: z.string().optional(),
      codeLength: z.number().min(4).max(6).optional(),
      duration: z.number().min(1).optional(),
    })
    .optional(),
  sms: z
    .object({
      smsProvider: z.string().optional(),
      messageTemplate: z.string().optional(),
      codeLength: z.number().min(4).max(6).optional(),
      duration: z.number().min(1).optional(),
    })
    .optional(),
});

export const CLIENTPORTAL_MAIL_SCHEMA = z.object({
  subject: z.string().optional(),
  invitationContent: z.string().optional(),
  registrationContent: z.string().optional(),
});

export const CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA = z.object({
  verifyByOTP: z.boolean().optional(),
  emailSubject: z.string().optional(),
  emailContent: z.string().optional(),
  smsContent: z.string().optional(),
});

export const CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA = z.object({
  userIds: z.array(z.string()).optional(),
  verifyCustomer: z.boolean().optional(),
  verifyCompany: z.boolean().optional(),
});

export const CLIENTPORTAL_GOOGLE_SCHEMA = z.object({
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  googleCredentials: z.string().optional(),
  googleRedirectUri: z.string().optional(),
});

export const CLIENTPORTAL_FACEBOOK_SCHEMA = z.object({
  facebookAppId: z.string().optional(),
});

export const CLIENTPORTAL_SOCIALPAY_SCHEMA = z.object({
  publicKey: z.string().optional(),
  certId: z.string().optional(),
});

export const CLIENTPORTAL_TOKI_SCHEMA = z.object({
  merchantId: z.string().optional(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const CLIENTPORTAL_SMS_PROVIDERS_SCHEMA = z.object({
  callPro: z
    .object({
      phone: z.string().optional(),
      token: z.string().optional(),
    })
    .optional(),
  twilio: z
    .object({
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      apiUrl: z.string().optional(),
    })
    .optional(),
});

export const CLIENTPORTAL_FIREBASE_SCHEMA = z
  .object({
    enabled: z.boolean().optional(),
    serviceAccountKey: z.string().optional(),
  })
  .refine((d) => !d.enabled || (d.serviceAccountKey ?? '').trim().length > 0, {
    message: 'Service account key is required when Firebase is enabled',
    path: ['serviceAccountKey'],
  })
  .refine(
    (d) => {
      const s = (d.serviceAccountKey ?? '').trim();
      if (!s) return true;
      try {
        JSON.parse(s);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Service account key must be valid JSON',
      path: ['serviceAccountKey'],
    },
  );
