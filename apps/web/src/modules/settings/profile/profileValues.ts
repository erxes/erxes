import {
  type coreContract,
  USER_LINK_NAMES,
  type User,
  type UserLinks,
} from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
import type { FieldPath } from 'react-hook-form';

export interface ProfileValues {
  firstName: string;
  middleName: string;
  lastName: string;
  shortName: string;
  username: string;
  email: string;
  phone: string;
  birthDate: string;
  workStartedDate: string;
  description: string;
  avatarUrl: string;
  links: UserLinks;
}

type ProfilePatch = Omit<InferContractRouterInputs<typeof coreContract>['users']['update'], 'id'>;

/** Emptying one of these clears it (`null`). */
const CLEARABLE = [
  'firstName',
  'middleName',
  'lastName',
  'shortName',
  'phone',
  'birthDate',
  'workStartedDate',
  'description',
  'avatarUrl',
] as const;

/** Username and email can't be emptied, only changed. */
const REQUIRED = ['username', 'email'] as const;

/** Every field a validation issue can point at. */
export const PROFILE_FIELDS: FieldPath<ProfileValues>[] = [
  ...CLEARABLE,
  ...REQUIRED,
  ...USER_LINK_NAMES.map((name) => `links.${name}` as const),
];

export const valuesOf = (user: User): ProfileValues => ({
  firstName: user.firstName ?? '',
  middleName: user.middleName ?? '',
  lastName: user.lastName ?? '',
  shortName: user.shortName ?? '',
  username: user.username ?? '',
  email: user.email,
  phone: user.phone ?? '',
  birthDate: user.birthDate ?? '',
  workStartedDate: user.workStartedDate ?? '',
  description: user.description ?? '',
  avatarUrl: user.avatarUrl ?? '',
  links: Object.fromEntries(USER_LINK_NAMES.map((name) => [name, user.links[name] ?? ''])),
});

/** Only what changed. */
export const patchOf = (before: ProfileValues, after: ProfileValues) => {
  const patch: ProfilePatch = {};

  for (const field of CLEARABLE) {
    const value = after[field].trim();

    if (value !== before[field].trim()) patch[field] = value || null;
  }

  for (const field of REQUIRED) {
    const value = after[field].trim();

    if (value && value !== before[field].trim()) patch[field] = value;
  }

  const links: NonNullable<ProfilePatch['links']> = {};

  for (const name of USER_LINK_NAMES) {
    const value = (after.links[name] ?? '').trim();

    if (value !== (before.links[name] ?? '').trim()) links[name] = value || null;
  }

  if (Object.keys(links).length) patch.links = links;

  return patch;
};
