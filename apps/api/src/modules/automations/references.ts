import { type Db, products, users } from '@erxes/core-db';
import { inArray } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { loadSubjects, SUBJECT_TABLES } from './subjects';
import { referenceKey, referenceOf, referencesIn } from './templates';
import { valueAt } from './conditions';

const REFERENCE_TYPES = ['customer', 'company', 'user', 'product'] as const;

type ReferenceType = (typeof REFERENCE_TYPES)[number];

const isReferenceType = (type: string): type is ReferenceType =>
  REFERENCE_TYPES.some((item) => item === type);

const loaders: Record<ReferenceType, (tx: Db, ids: string[]) => Promise<{ id: string }[]>> = {
  customer: (tx, ids) =>
    loadSubjects(tx, 'customer', inArray(SUBJECT_TABLES.customer.id, ids), { limit: ids.length }),
  company: (tx, ids) =>
    loadSubjects(tx, 'company', inArray(SUBJECT_TABLES.company.id, ids), { limit: ids.length }),
  user: (tx, ids) =>
    tx
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(inArray(users.id, ids)),
  product: (tx, ids) =>
    tx
      .select({
        id: products.id,
        name: products.name,
        code: products.code,
        price: products.price,
        currency: products.currency,
        unit: products.unit,
      })
      .from(products)
      .where(inArray(products.id, ids)),
};

const wantedIds = (input: unknown, context: Record<string, unknown>) => {
  const wanted = new Map<ReferenceType, Set<string>>();

  for (const path of referencesIn(input)) {
    const { idPath, type } = referenceOf(path);
    const id = valueAt(context, idPath);

    if (!isReferenceType(type) || typeof id !== 'string' || !id) continue;

    wanted.set(type, (wanted.get(type) ?? new Set()).add(id));
  }

  return wanted;
};

export const loadReferences = async (tx: Db, input: unknown, context: Record<string, unknown>) => {
  const refs = new Map<string, unknown>();

  await inOrder([...wantedIds(input, context)], async ([type, ids]) => {
    const rows = await loaders[type](tx, [...ids]);

    for (const row of rows) refs.set(referenceKey(type, row.id), row);
  });

  return refs;
};
