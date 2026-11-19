/**
 * `users` → `core_users`, every one of them, inactive and system members too, keeping their ids
 * and their password hashes as stored (sign-in checks old bcrypt hashes). A member whose email
 * already belongs to a member of the organisation merges into that member through the id map.
 */
import { z } from 'zod';
import { remember } from './idMap';
import { importRoles } from './roles';
import { insert, MINE, readAll, type Run, unit } from './run';
import {
  createdOf,
  day,
  email,
  flag,
  idOf,
  ids,
  links,
  readOr,
  record,
  text,
  when,
} from './values';

const Details = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z.object({
    fullName: text,
    avatar: text,
    shortName: text,
    firstName: text,
    middleName: text,
    lastName: text,
    birthDate: day,
    workStartedDate: day,
    description: text,
    operatorPhone: text,
    position: text,
  }),
);

export const UserDocument = record({
  email: text,
  username: text,
  password: text,
  isOwner: flag,
  isActive: flag,
  role: text,
  appId: text,
  employeeId: text,
  phone: text,
  firstName: text,
  lastName: text,
  links,
  details: Details,
  groupIds: ids,
  branchIds: ids,
  departmentIds: ids,
  createdAt: when,
  updatedAt: when,
});

export type UserDocument = z.infer<typeof UserDocument>;

const OldRole = z.object({ userId: text, role: text });

const fullName = (user: UserDocument) => {
  const first = user.details.firstName ?? user.firstName;
  const last = user.details.lastName ?? user.lastName;

  return user.details.fullName ?? ([first, last].filter(Boolean).join(' ') || null);
};

/**
 * The member's role: the 3.4 `roles` entry (owner, admin, member) wins, then an old owner flag
 * (admin, so the organisation's owners stay who they are), then their user group's role.
 */
export const roleOf = (
  user: UserDocument,
  oldRole: string | null,
  groupRoles: Map<string, string>,
) => {
  if (oldRole === 'owner' || oldRole === 'admin') return oldRole;

  if (user.isOwner) return 'admin';

  const group = user.groupIds.find((id) => groupRoles.has(id));

  return (group && groupRoles.get(group)) ?? 'member';
};

/** System and agent accounts, and members with no email, never sign in; inactive ones are disabled. */
export const userRow = (user: UserDocument, role: string) => {
  const machine = user.role === 'system' || Boolean(user.appId);

  return [
    user.id,
    email(user.email),
    user.username,
    fullName(user),
    user.details.avatar,
    role,
    user.isActive && !machine ? 'active' : 'disabled',
    user.password,
    user.details.firstName ?? user.firstName,
    user.details.middleName,
    user.details.lastName ?? user.lastName,
    user.details.shortName,
    user.employeeId,
    user.details.operatorPhone ?? user.phone,
    user.details.birthDate,
    user.details.workStartedDate,
    user.details.description ?? user.details.position,
    JSON.stringify(user.links),
    !machine && email(user.email) !== null,
    createdOf(user.id, user.createdAt, user.updatedAt),
    user.updatedAt ?? createdOf(user.id, user.createdAt),
  ];
};

const COLUMNS = [
  'id',
  'email',
  'username',
  'full_name',
  'avatar_url',
  'role',
  'status',
  'password_hash',
  'first_name',
  'middle_name',
  'last_name',
  'short_name',
  'employee_id',
  'phone',
  'birth_date',
  'work_started_date',
  'description',
  'links',
  'can_sign_in',
  'created_at',
  'updated_at',
];

/** Imports roles, then members. */
export const importUsers = async (run: Run) => {
  const groupRoles = await importRoles(run);

  const oldRoles = new Map(
    (await readAll(run, 'roles')).flatMap((doc) => {
      const parsed = OldRole.safeParse(doc);

      return parsed.success && parsed.data.userId ? [[parsed.data.userId, parsed.data.role]] : [];
    }),
  );

  run.report.of('roles', 'core_users.role');
  run.report.seen('roles', oldRoles.size);
  run.report.copied('roles', oldRoles.size);

  const users = (await run.mongo.collection('users').find().toArray()).flatMap((doc) => {
    const user = readOr(UserDocument, doc);

    if (!user) run.report.skip('users', 'unreadable _id', idOf(doc));

    return user ? [user] : [];
  });

  run.report.of('users', 'core_users');
  run.report.seen('users', users.length);

  const { rows: taken } = await run.pg.query<{ id: string; email: string }>(
    `SELECT id, lower(email) AS email FROM core_users WHERE email IS NOT NULL AND ${MINE}`,
  );

  const byEmail = new Map(taken.map((row) => [row.email, row.id]));
  const merged: [string, string][] = [];

  const fresh = users.filter((user) => {
    const owner = byEmail.get(email(user.email) ?? '');

    if (owner && owner !== user.id) {
      merged.push([user.id, owner]);
      run.report.note('users', 'email already a member; merged into them', user.id);

      return false;
    }

    return true;
  });

  for (const user of fresh.filter((each) => each.groupIds.length > 1)) {
    run.report.note('users', 'in several user groups; got the first group’s role', user.id);
  }

  await unit(run, async () => {
    await insert(run, {
      collection: 'users',
      table: 'core_users',
      columns: COLUMNS,
      rows: fresh.map((user) =>
        userRow(user, roleOf(user, oldRoles.get(user.id) ?? null, groupRoles)),
      ),
      keys: fresh.map((user) => user.id),
    });
    await remember(run, 'users', 'user', merged);
  });

  return users;
};
