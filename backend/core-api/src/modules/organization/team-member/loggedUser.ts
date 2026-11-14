import { IUserDocument } from 'erxes-api-shared/core-types';

// Credentials a user document carries. Nothing outside authentication needs
// them, and event logs fan out to the logs store and automation runs.
export const SECRET_USER_FIELDS = [
  'password',
  'resetPasswordToken',
  'registrationToken',
  'registrationTokenExpires',
] as const;

export const SECRET_USER_FIELDS_PROJECTION = Object.fromEntries(
  SECRET_USER_FIELDS.map((field) => [field, 0]),
) as Record<(typeof SECRET_USER_FIELDS)[number], 0>;

export const withoutUserSecrets = <T extends Record<string, unknown>>(
  doc: T,
): Omit<T, (typeof SECRET_USER_FIELDS)[number]> => {
  const rest: Record<string, unknown> = { ...doc };

  for (const field of SECRET_USER_FIELDS) {
    delete rest[field];
  }

  return rest as Omit<T, (typeof SECRET_USER_FIELDS)[number]>;
};

// What a user write hands to event logs
export const toLoggedUser = (user: IUserDocument) =>
  withoutUserSecrets(user.toObject() as Record<string, unknown>);
