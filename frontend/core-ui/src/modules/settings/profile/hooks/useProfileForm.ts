import { useForm, type FieldNamesMarkedBoolean } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isDeeplyEqual } from 'erxes-ui';

const discordIdRegex = /^\d{17,19}$/;
const discordUrlRegex = new RegExp(
  '^https://(?:www\\.)?discord\\.com/users/[A-Za-z0-9-]+/?$|' +
    '^https://(?:www\\.)?discord\\.gg/[A-Za-z0-9-]+/?$',
);

export const profileValidationSchema = z
  .object({
    details: z
      .object({
        avatar: z.string().optional().nullable(),
        coverPhoto: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        position: z.string().optional().nullable(),
        firstName: z.string().optional().nullable(),
        lastName: z.string().optional().nullable(),
        middleName: z.string().optional().nullable(),
        shortName: z.string().optional().nullable(),
        operatorPhone: z.string().optional().nullable(),
        birthDate: z.date().or(z.string()).optional().nullable(),
        workStartedDate: z.date().or(z.string()).optional().nullable(),
        location: z.string().optional().nullable(),
        employeeId: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
    links: z
      .object({
        facebook: z
          .string()
          .url()
          .regex(
            /^https:\/\/(www\.)?facebook\.com\/((profile\.php\?id=\d+)|([A-Za-z0-9._-]+))\/?$/,
            {
              message: 'Invalid Facebook URL',
            },
          )
          .optional()
          .or(z.literal('')),
        twitter: z
          .string()
          .url()
          .regex(
            /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9._-]+\/?$/,
            {
              message: 'Invalid Twitter/X URL',
            },
          )
          .optional()
          .or(z.literal('')),
        website: z
          .string()
          .url({ message: 'Invalid website URL' })
          .optional()
          .or(z.literal('')),

        discord: z
          .string()
          .refine(
            (val) =>
              val === '' ||
              discordIdRegex.test(val) ||
              discordUrlRegex.test(val),
            {
              message: 'Enter a valid Discord profile URL or User ID',
            },
          )
          .optional(),
        github: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9._-]+\/?$/, {
            message: 'Invalid GitHub URL',
          })
          .optional()
          .or(z.literal('')),
        instagram: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$/, {
            message: 'Invalid Instagram URL',
          })
          .optional()
          .or(z.literal('')),
      })
      .passthrough()
      .nullish()
      .transform((links) => links ?? {}),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().trim().email('Email must be a valid email'),
    positionIds: z
      .array(z.string())
      .nullish()
      .transform((ids) => ids ?? []),
  })
  .required();

export type FormType = z.infer<typeof profileValidationSchema>;
export type ProfilePatch = Partial<FormType>;

export const normalizeProfileLinks = (
  links: FormType['links'] | null | undefined,
): FormType['links'] => ({
  ...links,
  github:
    links?.github ?? (typeof links?.gitHub === 'string' ? links.gitHub : ''),
});

const pickDirtyFields = <T extends object>(
  values: T,
  dirtyFields: unknown,
): Partial<T> => {
  const keys = new Set(
    Object.entries(
      dirtyFields && typeof dirtyFields === 'object' ? dirtyFields : {},
    )
      .filter(([, dirty]) => dirty === true)
      .map(([key]) => key),
  );
  const patch: Partial<T> = {};
  for (const key in values) {
    if (
      Object.prototype.hasOwnProperty.call(values, key) &&
      (dirtyFields === true || keys.has(key))
    ) {
      patch[key] = values[key];
    }
  }
  return patch;
};

const hasDirtyPositions = (dirty: unknown): boolean =>
  Array.isArray(dirty) ? dirty.includes(true) : dirty === true;

export const getProfilePatch = (
  values: FormType,
  dirtyFields: FieldNamesMarkedBoolean<FormType>,
): ProfilePatch => {
  const patch: ProfilePatch = {};
  if (dirtyFields.username) patch.username = values.username;
  if (dirtyFields.email) patch.email = values.email;
  if (hasDirtyPositions(dirtyFields.positionIds))
    patch.positionIds = values.positionIds;
  if (dirtyFields.details && values.details) {
    const details = pickDirtyFields(values.details, dirtyFields.details);
    if (Object.keys(details).length > 0) patch.details = details;
  }
  if (dirtyFields.links) {
    const links = pickDirtyFields(values.links, dirtyFields.links);
    if (Object.keys(links).length > 0) patch.links = links;
  }
  return patch;
};

const pickChangedFields = <T extends object>(
  values: T,
  previous: T,
): Partial<T> => {
  const changed: Partial<T> = {};
  for (const key in values) {
    if (
      Object.prototype.hasOwnProperty.call(values, key) &&
      !isDeeplyEqual(values[key], previous[key], { strict: true })
    ) {
      changed[key] = values[key];
    }
  }
  return changed;
};

export const getProfileValuesAfterSave = (
  saved: FormType,
  submitted: FormType,
  current: FormType,
): FormType => {
  const values = { ...saved, ...pickChangedFields(current, submitted) };
  if (current.details) {
    values.details = {
      ...saved.details,
      ...pickChangedFields(current.details, submitted.details ?? {}),
    };
  }
  values.links = {
    ...saved.links,
    ...pickChangedFields(current.links, submitted.links),
  };
  return values;
};

const useProfileForm = () => {
  const form = useForm<FormType>({
    mode: 'onBlur',
    defaultValues: {
      links: {
        facebook: '',
        twitter: '',
        website: '',
        discord: '',
        github: '',
        instagram: '',
      },
      username: '',
      email: '',
      positionIds: [],
    },
    resolver: zodResolver(profileValidationSchema),
  });

  return { form };
};

export { useProfileForm };
