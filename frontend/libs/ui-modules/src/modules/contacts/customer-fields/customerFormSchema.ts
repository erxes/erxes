import { z } from 'zod';
import { ISystemFieldRules } from '../../properties/hooks/useSystemFieldRules';

// One shape for every customer form, so its field renderers fit both.
export const customerFormSchema = z.object({
  state: z.string().default(''),
  avatar: z.string().nullable().default(null),
  firstName: z.string().default(''),
  lastName: z.string().default(''),
  middleName: z.string().default(''),
  sex: z.number().nullable().default(null),
  birthDate: z.date().nullable().default(null),
  primaryEmail: z
    .union([z.literal(''), z.string().email('Invalid email format')])
    .default(''),
  primaryPhone: z.string().default(''),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.union([z.literal(''), z.string().email()])).default([]),
  ownerId: z.string().default(''),
  description: z.string().default(''),
  isSubscribed: z.string().default('Yes'),
  links: z.record(z.unknown()).default({}),
  code: z.string().default(''),
  phoneValidationStatus: z.string().default('unknown'),
});

export type ICustomerFormValues = z.infer<typeof customerFormSchema>;

export const CUSTOMER_FORM_DEFAULTS: ICustomerFormValues =
  customerFormSchema.parse({});

type TFieldCode = keyof ICustomerFormValues;

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && String(value).trim() !== '';

// Settings decide what a form asks for, so the schema follows them.
export const buildCustomerSchema = ({
  isShown,
  isRequired,
  groups,
}: ISystemFieldRules) =>
  customerFormSchema.superRefine((values, ctx) => {
    for (const code of Object.keys(values) as TFieldCode[]) {
      if (isShown(code) && isRequired(code) && !hasValue(values[code])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [code],
          message: 'Required',
        });
      }
    }

    for (const codes of groups) {
      if (!codes.some((code) => hasValue(values[code as TFieldCode]))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [codes[0]],
          message: 'Fill in a name, an e-mail or a phone',
        });
      }
    }
  });
