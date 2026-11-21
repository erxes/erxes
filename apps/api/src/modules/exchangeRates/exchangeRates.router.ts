import { db } from '@erxes/core-db';
import {
  activeExchangeRate,
  createExchangeRate,
  listExchangeRates,
  removeExchangeRates,
  updateExchangeRate,
} from '~/modules/exchangeRates/exchangeRates.service';
import { audited, recordOf, scoped } from '~/orpc';

/** How a rate reads in the audit log: `USD 2026-01-31`. */
const labelOf = (rate: { rateCurrency: string; date: string }) => ({
  label: `${rate.rateCurrency} ${rate.date}`,
});

export const exchangeRatesRouter = {
  list: scoped.exchangeRates.list.handler(({ input }) => listExchangeRates(db(), input)),
  getActiveRate: scoped.exchangeRates.getActiveRate.handler(({ input }) =>
    activeExchangeRate(db(), input),
  ),
  create: scoped.exchangeRates.create.handler(({ input }) =>
    audited(
      (tx) => createExchangeRate(tx, input),
      (rate) => recordOf('exchange_rate', 'created', rate.id, labelOf(rate)),
    ),
  ),
  update: scoped.exchangeRates.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateExchangeRate(tx, id, changes),
      (rate) => ({ ...recordOf('exchange_rate', 'updated', id, labelOf(rate)), metadata: changes }),
    ),
  ),
  remove: scoped.exchangeRates.remove.handler(({ input }) =>
    audited(
      (tx) => removeExchangeRates(tx, input.ids),
      ({ rows }) =>
        rows.map((rate) => recordOf('exchange_rate', 'deleted', rate.id, labelOf(rate))),
    ),
  ),
};
