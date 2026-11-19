/**
 * `client_portal_users` were the people who signed in to old client portals. Each becomes the
 * customer it points at (`erxesCustomerId`), else the customer with its email or phone, else a
 * new customer with its id; the id map sends the portal id to that customer. A verified email or
 * phone becomes a sign-in (`core_customer_logins`). Core signs customers in with codes, so old
 * passwords, tokens and devices stay out.
 */
import { inOrder } from '~/lib/sequence';
import { remember, resolve } from './idMap';
import { emailsOf, phonesOf } from './contacts';
import { insert, MINE, readAll, type Run, unit } from './run';
import { createdOf, flag, idOf, optionalId, readOr, record, text, when } from './values';

export const PortalUser = record({
  type: text,
  email: text,
  phone: text,
  firstName: text,
  lastName: text,
  username: text,
  avatar: text,
  erxesCustomerId: optionalId,
  isVerified: flag,
  isEmailVerified: flag,
  isPhoneVerified: flag,
  lastLoginAt: when,
  lastSeenAt: when,
  createdAt: when,
  updatedAt: when,
});

type PortalUser = NonNullable<ReturnType<typeof PortalUser.parse>>;

const NAME = 'client_portal_users';

interface Known {
  ids: Set<string>;
  byEmail: Map<string, string>;
  byPhone: Map<string, string>;
}

/** The core customers the portal users could be: by id, email or phone. */
const knownCustomers = async (run: Run, users: PortalUser[]): Promise<Known> => {
  const ids = users.flatMap((user) =>
    user.erxesCustomerId ? [resolve('customer', user.erxesCustomerId)] : [],
  );

  const emails = users.flatMap((user) => emailsOf(user.email, []));
  const phones = users.flatMap((user) => phonesOf(user.phone, []));

  const { rows } = await run.pg.query<{ id: string; emails: string[]; phones: string[] }>(
    `SELECT id, emails, phones FROM core_customers
      WHERE ${MINE} AND (id = ANY($1::text[]) OR emails && $2::text[] OR phones && $3::text[])`,
    [ids, emails, phones],
  );

  return {
    ids: new Set(rows.map((row) => row.id)),
    byEmail: new Map(rows.flatMap((row) => row.emails.map((value) => [value, row.id]))),
    byPhone: new Map(rows.flatMap((row) => row.phones.map((value) => [value, row.id]))),
  };
};

/** The customer a portal user is, and whether it has to be made. */
export const customerFor = (user: PortalUser, known: Known) => {
  const linked = user.erxesCustomerId && resolve('customer', user.erxesCustomerId);
  const email = emailsOf(user.email, [])[0];
  const phone = phonesOf(user.phone, [])[0];

  const found =
    (linked && known.ids.has(linked) ? linked : undefined) ??
    (email ? known.byEmail.get(email) : undefined) ??
    (phone ? known.byPhone.get(phone) : undefined);

  return { id: found ?? user.id, create: !found, email, phone };
};

/** Sign-ins for the addresses the portal had verified. */
export const loginsOf = (user: PortalUser, customerId: string) => {
  const email = emailsOf(user.email, [])[0];
  const phone = phonesOf(user.phone, [])[0];
  const used = user.lastLoginAt ?? user.lastSeenAt;
  const createdAt = createdOf(user.id, user.createdAt, user.updatedAt);

  return [
    ...(email && (user.isEmailVerified || (user.isVerified && !user.isPhoneVerified))
      ? [[`${user.id}-email`, customerId, 'email', email, createdAt, used]]
      : []),
    ...(phone && user.isPhoneVerified
      ? [[`${user.id}-phone`, customerId, 'phone', phone, createdAt, used]]
      : []),
  ];
};

const newCustomer = (user: PortalUser, email: string | undefined, phone: string | undefined) => {
  const createdAt = createdOf(user.id, user.createdAt, user.updatedAt);

  return [
    user.id,
    'customer',
    user.firstName ?? user.username,
    user.lastName,
    user.avatar,
    email ?? null,
    email ? [email] : [],
    phone ?? null,
    phone ? [phone] : [],
    createdAt,
    user.updatedAt ?? createdAt,
    user.lastSeenAt ?? user.updatedAt ?? createdAt,
    'client_portal',
    JSON.stringify({ importedFrom: 'erxes 3 client portal' }),
  ];
};

const CUSTOMER_COLUMNS = [
  'id',
  'state',
  'first_name',
  'last_name',
  'avatar_url',
  'primary_email',
  'emails',
  'primary_phone',
  'phones',
  'created_at',
  'updated_at',
  'last_activity_at',
  'source',
  'source_details',
];

/** Portal users as customers and their verified addresses as sign-ins. */
export const importClientPortalUsers = async (run: Run) => {
  const docs = await readAll(run, NAME);

  run.report.of(NAME, 'core_customers, core_customer_logins');
  run.report.seen(NAME, docs.length);

  const users = docs.flatMap((raw) => {
    const user = readOr(PortalUser, raw);

    if (!user) run.report.skip(NAME, 'unreadable _id', idOf(raw));
    else if (user.type === 'company') {
      run.report.skip(NAME, 'company account: core signs in customers only', user.id);

      return [];
    }

    return user ? [user] : [];
  });

  await unit(run, async () => {
    const known = await knownCustomers(run, users);
    const matched = users.map((user) => ({ user, ...customerFor(user, known) }));
    const created = matched.filter((each) => each.create);

    for (const each of matched) {
      if (!each.create) run.report.note(NAME, 'joined the customer it already was', each.user.id);
    }

    await insert(run, {
      collection: NAME,
      table: 'core_customers',
      columns: CUSTOMER_COLUMNS,
      rows: created.map((each) => newCustomer(each.user, each.email, each.phone)),
      keys: created.map((each) => each.user.id),
    });

    await remember(
      run,
      NAME,
      'customer',
      matched.map((each) => [each.user.id, each.id]),
    );

    await saveLogins(
      run,
      matched.flatMap((each) => loginsOf(each.user, each.id)),
    );
  });
};

const LOGINS = `${NAME} (sign-ins)`;

/** Writes the sign-ins and adds each address to its customer's list, as core does. */
const saveLogins = async (run: Run, logins: ReturnType<typeof loginsOf>) => {
  run.report.of(LOGINS, 'core_customer_logins');
  run.report.seen(LOGINS, logins.length);

  const copied = await insert(run, {
    collection: LOGINS,
    table: 'core_customer_logins',
    columns: ['id', 'customer_id', 'kind', 'value', 'created_at', 'last_used_at'],
    rows: logins,
    keys: logins.map((row) => String(row[0])),
  });

  if (copied < logins.length) {
    run.report.note(
      LOGINS,
      'address already a sign-in (the same person on another old portal, or a re-run)',
      '',
      logins.length - copied,
    );
  }

  // Only sign-ins that were saved for this customer; an address another customer signs in with
  // stays theirs.
  await inOrder(['emails', 'phones'] as const, (list) =>
    run.pg.query(
      `UPDATE core_customers c
          SET ${list} = c.${list} || ARRAY(SELECT v FROM unnest(l.added) v WHERE v <> ALL (c.${list}))
         FROM (SELECT customer_id, array_agg(value) AS added FROM core_customer_logins
                WHERE ${MINE} AND kind = $2 AND id = ANY($1::text[]) GROUP BY customer_id) l
        WHERE c.org_id = current_setting('app.org_id') AND c.id = l.customer_id
          AND NOT (l.added <@ c.${list})`,
      [logins.map((row) => String(row[0])), list === 'emails' ? 'email' : 'phone'],
    ),
  );
};
