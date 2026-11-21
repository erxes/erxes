import type { CursorQuery } from '@erxes/core-contract';
import { type Db, exchangeRates, newId, organizations } from '@erxes/core-db';
import { and, desc, eq, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { localDay } from '~/lib/orgTime';
import { oneRow } from '~/lib/rows';

interface RateFields {
  date: string;
  mainCurrency: string;
  rateCurrency: string;
  rate: number;
}

/** The organisation's currency and time zone: a rate's default main currency and its day. */
const orgMoney = async (client: Db) =>
  oneRow(
    await client
      .select({ currency: organizations.currency, timezone: organizations.timezone })
      .from(organizations)
      .limit(1),
  );

const findRate = async (client: Db, id: string) => {
  const [row] = await client.select().from(exchangeRates).where(eq(exchangeRates.id, id)).limit(1);

  if (!row) throw notFound('Exchange rate');

  return row;
};

/** A currency's rate in itself is always 1, so the pair needs two currencies. */
const checkPair = ({
  mainCurrency,
  rateCurrency,
}: Pick<RateFields, 'mainCurrency' | 'rateCurrency'>) => {
  if (mainCurrency !== rateCurrency) return;

  const message = `${rateCurrency} is the main currency, its rate is always 1`;

  throw fail('INVALID_INPUT', message, { issues: [{ path: ['rateCurrency'], message }] });
};

export const listExchangeRates = (
  client: Db,
  query: CursorQuery & {
    searchValue?: string;
    mainCurrency?: string;
    rateCurrency?: string;
    date?: string;
  },
) =>
  keysetPage(
    client,
    { table: exchangeRates, id: exchangeRates.id, createdAt: exchangeRates.createdAt },
    and(
      query.searchValue
        ? or(
            ilike(exchangeRates.mainCurrency, containsPattern(query.searchValue)),
            ilike(exchangeRates.rateCurrency, containsPattern(query.searchValue)),
          )
        : undefined,
      query.mainCurrency ? eq(exchangeRates.mainCurrency, query.mainCurrency) : undefined,
      query.rateCurrency ? eq(exchangeRates.rateCurrency, query.rateCurrency) : undefined,
      query.date ? eq(exchangeRates.date, query.date) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(exchangeRates)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

/**
 * 3.x's `getActiveRate`: the pair's latest rate starting on `date`'s day or before. A moment
 * counts on its day in the organisation's time zone, as 3.x took the day in the server's.
 */
export const activeExchangeRate = async (
  client: Db,
  input: { date: string; rateCurrency: string; mainCurrency?: string },
) => {
  const org = await orgMoney(client);
  const day = input.date.includes('T') ? localDay(org.timezone, new Date(input.date)) : input.date;

  const [row] = await client
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.mainCurrency, input.mainCurrency ?? org.currency),
        eq(exchangeRates.rateCurrency, input.rateCurrency),
        lte(exchangeRates.date, day),
      ),
    )
    .orderBy(desc(exchangeRates.date))
    .limit(1);

  return row ?? null;
};

export const createExchangeRate = async (
  client: Db,
  input: Omit<RateFields, 'mainCurrency'> & { mainCurrency?: string },
) => {
  const fields = {
    ...input,
    mainCurrency: input.mainCurrency ?? (await orgMoney(client)).currency,
  };

  checkPair(fields);

  return oneRow(
    await client
      .insert(exchangeRates)
      .values({ id: newId(), ...fields })
      .returning(),
  );
};

export const updateExchangeRate = async (client: Db, id: string, changes: Partial<RateFields>) => {
  const current = await findRate(client, id);

  checkPair({ ...current, ...changes });

  return oneRow(
    await client
      .update(exchangeRates)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(exchangeRates.id, id))
      .returning(),
  );
};

export const removeExchangeRates = async (client: Db, ids: string[]) => {
  const removed = await client
    .delete(exchangeRates)
    .where(inArray(exchangeRates.id, ids))
    .returning();

  return { removed: removed.length, rows: removed };
};
