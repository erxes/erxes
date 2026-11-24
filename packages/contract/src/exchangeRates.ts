import { exchangeRates } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { COMMON_ERRORS } from './errors';
import { CursorQuery, cursorPageOf, Id, isoDate } from './common';
import { Currency } from './money';

/** A day, `YYYY-MM-DD`. */
const Day = z.iso.date();

/** From `date` on, 1 `rateCurrency` is worth `rate` of `mainCurrency`, until a later rate of the pair. */
export const ExchangeRate = createSelectSchema(exchangeRates, {
  id: Id,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  /** The day it starts (`YYYY-MM-DD`). */
  date: true,
  mainCurrency: true,
  rateCurrency: true,
  rate: true,
  createdAt: true,
  updatedAt: true,
});

export type ExchangeRate = z.infer<typeof ExchangeRate>;

const ExchangeRateFields = createUpdateSchema(exchangeRates, {
  date: () => Day,
  mainCurrency: () => Currency,
  rateCurrency: () => Currency,
  rate: (rate) => rate.positive(),
}).pick({ date: true, mainCurrency: true, rateCurrency: true, rate: true });

/** Which rate is in force: `rateCurrency`'s against `mainCurrency` (the organisation's) on `date`. */
export const ActiveRateQuery = z.object({
  /** A day, or a moment, whose day in the organisation's time zone counts. */
  date: z.union([Day, z.iso.datetime({ offset: true })]),
  rateCurrency: Currency,
  mainCurrency: Currency.optional(),
});

export type ActiveRateQuery = z.infer<typeof ActiveRateQuery>;

const base = oc.errors(COMMON_ERRORS);

/**
 * Exchange rates the organisation keeps (3.x's mongolian Settings › Exchange rates), and the
 * rate in force on a day, which accounting values foreign-currency amounts at.
 */
export const exchangeRatesContract = {
  list: base
    .route({
      method: 'GET',
      path: '/exchange-rates',
      summary: 'List exchange rates',
      description:
        'Newest first. `searchValue` matches either currency; plugins read them (exchange_rates:read)',
    })
    .input(
      CursorQuery.extend({
        searchValue: z.string().trim().max(100).optional(),
        mainCurrency: Currency.optional(),
        rateCurrency: Currency.optional(),
        /** Only the rates starting on this day. */
        date: Day.optional(),
      }),
    )
    .output(cursorPageOf(ExchangeRate)),
  getActiveRate: base
    .route({
      method: 'GET',
      path: '/exchange-rates/active',
      summary: 'Get the exchange rate in force on a day',
      description:
        "The rate of `rateCurrency` in force on `date`: the pair's latest rate starting on that day or before, in the organisation's time zone; null when there is none. `mainCurrency` is the organisation's currency unless given",
    })
    .input(ActiveRateQuery)
    .output(ExchangeRate.nullable()),
  create: base
    .route({
      method: 'POST',
      path: '/exchange-rates',
      successStatus: 201,
      summary: 'Add an exchange rate',
      description:
        '`mainCurrency` is the organisation’s currency unless given. 409 TAKEN (`date`) when the pair has a rate on that day; 400 INVALID_INPUT when both currencies are the same',
    })
    .input(
      ExchangeRateFields.partial({ mainCurrency: true }).required({
        date: true,
        rateCurrency: true,
        rate: true,
      }),
    )
    .output(ExchangeRate),
  update: base
    .route({
      method: 'PATCH',
      path: '/exchange-rates/{id}',
      summary: 'Change an exchange rate',
      description:
        '409 TAKEN (`date`) when the pair has another rate on that day; 400 INVALID_INPUT when both currencies are the same',
    })
    .input(
      ExchangeRateFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(ExchangeRate),
  remove: base
    .route({
      method: 'POST',
      path: '/exchange-rates/remove',
      summary: 'Delete rates',
      description: 'Delete up to 100 rates by id and answer how many went; unknown ids are skipped',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(100) }))
    .output(z.object({ removed: z.int() })),
};
