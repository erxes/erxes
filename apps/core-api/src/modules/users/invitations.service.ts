import { db, type Db, newId, users, withTransaction } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, type Role, userCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { hashPassword } from '~/lib/crypto';
import { sendInvitation } from '~/modules/auth/tokens.service';
import { assertAssignable } from '~/modules/roles/roles.service';
import { splitFullName } from './userProfile';
import { conflictFrom, requireTeamManager, toUserDto, type UserRow } from './userRows';

interface InviteInput {
  email: string;
  role: Exclude<Role, 'owner'>;
  password?: string;
  fullName?: string;
  username?: string;
}

/** A new member row: with a password they can sign in at once, otherwise they stay invited. */
const inviteValues = async (actor: Actor, input: InviteInput) => ({
  id: newId(),
  orgId: actor.orgId,
  email: input.email.trim().toLowerCase(),
  ...(input.fullName ? { ...splitFullName(input.fullName), fullName: input.fullName } : {}),
  username: input.username ?? null,
  role: input.role,
  status: input.password ? ('active' as const) : ('invited' as const),
  passwordHash: input.password ? await hashPassword(input.password) : null,
  invitedBy: actor.userId,
});

/** Audits the invitations, and emails those invited without a password (sent once the invite commits). */
const announceInvites = async (tx: Db, actor: Actor, rows: UserRow[]) => {
  await recordAudit(
    tx,
    userCaller(actor),
    rows.map((row) => ({
      action: 'user.invited',
      targetType: 'user',
      targetId: row.id,
      targetLabel: row.email,
      metadata: { role: row.role, status: row.status },
    })),
  );

  for (const row of rows) {
    if (row.status === 'invited') await sendInvitation(tx, actor, row);
  }
};

export const inviteUser = async (client: Db, actor: Actor, input: InviteInput) => {
  requireTeamManager(actor, 'team.invite');
  await assertAssignable(client, actor, input.role);

  try {
    const values = await inviteValues(actor, input);

    const row = await client.transaction(async (tx) => {
      const inserted = oneRow(await tx.insert(users).values(values).returning());

      await announceInvites(tx, actor, [inserted]);

      return inserted;
    });

    return toUserDto(row);
  } catch (error) {
    return conflictFrom(error);
  }
};

/** Several invitations in one go: all are created, or none (409 names the taken emails). */
export const inviteUsers = async (actor: Actor, entries: InviteInput[]) => {
  requireTeamManager(actor, 'team.invite');

  for (const role of new Set(entries.map((entry) => entry.role))) {
    await assertAssignable(db(), actor, role);
  }

  const emails = entries.map((entry) => entry.email.trim().toLowerCase());
  const repeated = [...new Set(emails.filter((email, index) => emails.indexOf(email) !== index))];

  if (repeated.length) {
    throw new HttpError(409, 'EMAIL_TAKEN', `Invited twice: ${repeated.join(', ')}`, {
      emails: repeated,
    });
  }

  const values = await Promise.all(entries.map((entry) => inviteValues(actor, entry)));

  return withTransaction(async (tx) => {
    const taken = await tx
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.orgId, actor.orgId), inArray(sql`lower(${users.email})`, emails)));

    if (taken.length) {
      const list = taken.map(({ email }) => email.toLowerCase());

      throw new HttpError(409, 'EMAIL_TAKEN', `Already a team member: ${list.join(', ')}`, {
        emails: list,
      });
    }

    try {
      const rows = await tx.insert(users).values(values).returning();

      await announceInvites(tx, actor, rows);

      return { data: rows.map(toUserDto) };
    } catch (error) {
      return conflictFrom(error);
    }
  });
};
