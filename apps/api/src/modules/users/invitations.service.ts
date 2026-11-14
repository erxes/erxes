import { caller, db, type Db, newId, users } from '@erxes/core-db';
import { inArray, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { hashPassword } from '~/lib/crypto';
import { sendInvitations } from '~/modules/auth/tokens.service';
import { assertAssignable } from '~/modules/roles/roles.service';
import { splitFullName } from './userProfile';
import type { UserRow } from './userRows';

interface InviteInput {
  email: string;
  role: string;
  password?: string;
  fullName?: string;
  username?: string;
}

/** A new member row: with a password they can sign in at once, otherwise they stay invited. */
const inviteValues = async (input: InviteInput) => ({
  id: newId(),
  email: input.email.trim().toLowerCase(),
  ...(input.fullName ? { ...splitFullName(input.fullName), fullName: input.fullName } : {}),
  username: input.username ?? null,
  role: input.role,
  status: input.password ? ('active' as const) : ('invited' as const),
  passwordHash: input.password ? await hashPassword(input.password) : null,
  invitedBy: caller('user').userId,
});

/** Audits the invitations, and emails those invited without a password (sent once the invite commits). */
const announceInvites = async (tx: Db, rows: UserRow[]) => {
  await recordAudit(
    tx,
    rows.map((row) => ({
      action: 'user.invited',
      targetType: 'user',
      targetId: row.id,
      targetLabel: row.email,
      metadata: { role: row.role, status: row.status },
    })),
  );

  await sendInvitations(
    tx,
    rows.filter((row) => row.status === 'invited'),
  );
};

export const inviteUser = async (client: Db, input: InviteInput) => {
  await assertAssignable(client, input.role);

  const values = await inviteValues(input);

  const inserted = oneRow(await client.insert(users).values(values).returning());

  await announceInvites(client, [inserted]);

  return inserted;
};

/** Several invitations in one go: all are created, or none (409 names the taken emails). */
export const inviteUsers = async (entries: InviteInput[]) => {
  await assertAssignable(
    db(),
    entries.map((entry) => entry.role),
  );

  const emails = entries.map((entry) => entry.email.trim().toLowerCase());
  const repeated = [...new Set(emails.filter((email, index) => emails.indexOf(email) !== index))];

  if (repeated.length) {
    throw fail('TAKEN', `Invited twice: ${repeated.join(', ')}`, {
      field: 'email',
      values: repeated,
    });
  }

  const values = await Promise.all(entries.map((entry) => inviteValues(entry)));

  const tx = db();

  const taken = await tx
    .select({ email: users.email })
    .from(users)
    .where(inArray(sql`lower(${users.email})`, emails));

  if (taken.length) {
    const list = taken.map(({ email }) => email.toLowerCase());

    throw fail('TAKEN', `Already a team member: ${list.join(', ')}`, {
      field: 'email',
      values: list,
    });
  }

  const rows = await tx.insert(users).values(values).returning();

  await announceInvites(tx, rows);

  return { data: rows };
};
