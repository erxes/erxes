import type { UserLinkName } from '@erxes/core-contract';
import type { users } from '@erxes/core-db';
import type { Role } from '~/http/auth';
import type { UserRow } from './userRows';

export interface UserChanges {
  email?: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
  role?: Role;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  shortName?: string | null;
  employeeId?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  workStartedDate?: string | null;
  description?: string | null;
  links?: Partial<Record<UserLinkName, string | null>>;
}

type NameParts = Pick<UserRow, 'firstName' | 'middleName' | 'lastName'>;

type UserSet = Partial<typeof users.$inferInsert>;

/** First word → first name, the rest → last name (as the 0003 migration did). */
export const splitFullName = (fullName: string): NameParts => {
  const [first = '', ...rest] = fullName.trim().split(/\s+/);

  return { firstName: first || null, middleName: null, lastName: rest.join(' ') || null };
};

const joinName = ({ firstName, middleName, lastName }: NameParts) =>
  [firstName, middleName, lastName].filter(Boolean).join(' ') || null;

/** Empty text clears a field. */
const blankToNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value?.trim() ? value.trim() : null;

/** The name columns, with `fullName` kept in step with the name parts. */
const nameChanges = (input: UserChanges, current?: NameParts): UserSet => {
  const parts = {
    firstName: blankToNull(input.firstName),
    middleName: blankToNull(input.middleName),
    lastName: blankToNull(input.lastName),
  };

  if (Object.values(parts).some((value) => value !== undefined)) {
    const next: NameParts = {
      firstName: parts.firstName === undefined ? (current?.firstName ?? null) : parts.firstName,
      middleName: parts.middleName === undefined ? (current?.middleName ?? null) : parts.middleName,
      lastName: parts.lastName === undefined ? (current?.lastName ?? null) : parts.lastName,
    };

    return { ...next, fullName: input.fullName ?? joinName(next) };
  }

  return input.fullName === undefined
    ? {}
    : { ...splitFullName(input.fullName), fullName: input.fullName };
};

/** Links merged into the current ones; an empty value removes a link. */
const linkChanges = (links: NonNullable<UserChanges['links']>, current: UserRow['links'] = {}) => {
  const next: Record<string, string> = { ...current };

  for (const [name, value] of Object.entries(links)) {
    if (value?.trim()) {
      next[name] = value.trim();
    } else {
      delete next[name];
    }
  }

  return next;
};

/** Name, profile and link changes. */
export const profileChanges = (
  input: UserChanges,
  current?: Pick<UserRow, 'firstName' | 'middleName' | 'lastName' | 'links'>,
) => {
  const set = nameChanges(input, current);

  for (const key of ['shortName', 'employeeId', 'phone', 'description'] as const) {
    const value = blankToNull(input[key]);

    if (value !== undefined) {
      set[key] = value;
    }
  }

  for (const key of ['birthDate', 'workStartedDate', 'username', 'avatarUrl'] as const) {
    if (input[key] !== undefined) {
      set[key] = input[key];
    }
  }

  if (input.links) {
    set.links = linkChanges(input.links, current?.links);
  }

  return set;
};
