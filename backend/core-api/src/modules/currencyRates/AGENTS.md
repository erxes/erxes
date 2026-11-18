# Currency rates module (core-api)

Core registry of exchange rates. Frontend lives in
`frontend/core-ui/src/modules/settings/currency-rates` (Settings → Exchange
rates, path `/settings/exchange-rates`).

## Layout

| Path            | Responsibility                                                     |
| --------------- | ------------------------------------------------------------------ |
| `db/definitions` | `currency_rates` schema; unique `(rateCurrency, source, date)`    |
| `db/models`     | `createRate`, `updateRate`, `removeRates`; all validation lives here |
| `graphql/`      | `currencyRates` list and `currencyRateAdd/Edit`, `currencyRatesRemove` |

## Invariants

- A rate means `1 rateCurrency = rate mainCurrency`. `mainCurrency` is copied
  from the `mainCurrency` config at creation, so changing the base later never
  rewrites old rows.
- `date` is stored as the day (`getFullDate`); one rate per currency, source
  and day.
- `source` is `'manual'` for hand-entered rows. Any other value belongs to a
  provider plugin and is read-only here (edit and delete skip it).
- Names avoid `exchangeRate*` on purpose: `mongolian_api` still owns the
  `exchange_rates` collection, the `ExchangeRate` federation type and the
  `exchangeRate*` operations, and accounting reads its rates from there.
- Permissions reuse the core `exchangeRates` module (`exchangeRatesRead`,
  `exchangeRatesManage`) already declared in `src/meta/permissions.ts`.
