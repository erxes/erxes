import { recordAudit } from "~/modules/audit/audit.service";
import { auditLogs, organizations, roles, users, withOrg, withSystem } from "@erxes/core-db";
import { effectivePermissions } from "~/modules/roles/roles.service";
import { and, eq, sql } from "drizzle-orm";
import { config } from "~/config";
import { HttpError } from "~/http/errors";
import { toOrganizationDto } from "~/modules/organizations/organizations.service";
import { toUserDto } from "~/modules/users/users.service";
import { verifyPassword } from "./password";

const invalidCredentials = () =>
  new HttpError(401, "INVALID_CREDENTIALS", "Wrong email or password");

/** `acme.erxes.io` → `acme`; plain hosts (localhost, IPs) name no organisation. */
export const subdomainFromHost = (host?: string): string | undefined => {
  const name = (host ?? "").split(":")[0]?.toLowerCase() ?? "";

  if (!name.includes(".") || /^\d+(\.\d+){3}$/.test(name)) {
    return undefined;
  }

  return name.split(".")[0] || undefined;
};

/**
 * Checks email + password in one organisation. The organisation comes from
 * the request, then the address, then DEFAULT_SUBDOMAIN; with none of them it
 * is the only organisation that has this email. Every failure answers the
 * same, so the response never tells whether an email exists.
 */
export const signIn = async (
  input: { email: string; password: string; subdomain?: string },
  host?: string
) => {
  const email = input.email.trim().toLowerCase();
  const subdomain =
    input.subdomain?.trim().toLowerCase() ||
    subdomainFromHost(host) ||
    config.auth.defaultSubdomain;

  // Before the organisation is known: the one narrow lookup across
  // organisations (by email, at most two rows). Everything after is scoped.
  const rows = await withSystem("sign-in discovery", (tx) =>
    tx
      .select({ user: users, organization: organizations })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .where(
        and(
          sql`lower(${users.email}) = ${email}`,
          subdomain
            ? sql`lower(${organizations.subdomain}) = ${subdomain}`
            : undefined
        )
      )
      .limit(2)
  );

  if (rows.length > 1) {
    throw new HttpError(
      400,
      "ORGANIZATION_REQUIRED",
      "This email belongs to several organisations: sign in at your organisation address"
    );
  }

  const match = rows[0];

  // Lockout per account, across replicas: 10 failures in 15 minutes.
  if (match) {
    const [recent] = await withOrg(match.user.orgId, (tx) =>
      tx
        .select({ failures: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.orgId, match.user.orgId),
            eq(auditLogs.targetId, match.user.id),
            eq(auditLogs.action, "auth.sign_in_failed"),
            sql`${auditLogs.createdAt} > now() - interval '15 minutes'`
          )
        )
    );

    if ((recent?.failures ?? 0) >= 10) {
      throw new HttpError(
        429,
        "TOO_MANY_ATTEMPTS",
        "Too many failed sign-ins for this account: try again in 15 minutes"
      );
    }
  }

  const valid = await verifyPassword(
    input.password,
    match?.user.passwordHash ?? null
  );

  if (match && (!valid || match.user.status !== "active")) {
    await withOrg(match.user.orgId, (tx) => recordAudit(
      tx,
      { orgId: match.user.orgId, actorType: "user", actorId: match.user.id, source: "core" },
      {
        action: "auth.sign_in_failed",
        targetType: "user",
        targetId: match.user.id,
        targetLabel: match.user.email,
        metadata: { reason: valid ? `account ${match.user.status}` : "wrong password" },
      }
    ));
  }

  // An unknown email at a known organisation: worth seeing (guessing, typos).
  if (!match && subdomain) {
    const [organization] = await withSystem("sign-in discovery", (tx) =>
      tx
        .select({ id: organizations.id })
        .from(organizations)
        .where(sql`lower(${organizations.subdomain}) = ${subdomain}`)
        .limit(1)
    );

    if (organization) {
      await withOrg(organization.id, (tx) => recordAudit(
        tx,
        { orgId: organization.id, actorType: "system", actorId: null },
        {
          action: "auth.sign_in_failed",
          targetType: "user",
          targetLabel: email,
          metadata: { reason: "unknown email" },
        }
      ));
    }
  }

  if (!match || !valid || match.user.status !== "active") {
    throw invalidCredentials();
  }

  await withOrg(match.user.orgId, (tx) => recordAudit(
    tx,
    { orgId: match.user.orgId, actorType: "user", actorId: match.user.id, source: "core" },
    { action: "auth.signed_in", targetType: "user", targetId: match.user.id, targetLabel: match.user.email }
  ));

  return getSession(match.user.orgId, match.user.id);
};

export const getSession = async (orgId: string, userId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx
      .select({ user: users, organization: organizations, permissions: roles.permissions })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(and(eq(users.id, userId), eq(users.orgId, orgId)))
      .limit(1);

    if (!row) {
      throw new HttpError(401, "UNAUTHORIZED", "Sign in to continue");
    }

    return {
      user: toUserDto(row.user),
      organization: toOrganizationDto(row.organization),
      // Spelled out for the UI: what this member may do.
      permissions: await effectivePermissions(tx, { orgId, role: row.user.role, permissions: row.permissions }),
    };
  });
