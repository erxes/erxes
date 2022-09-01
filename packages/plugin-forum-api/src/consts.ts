export const USER_TYPES = ['CRM', 'CP'] as const;
export type UserTypes = typeof USER_TYPES[number];
