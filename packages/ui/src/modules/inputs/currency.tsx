import { onDemand } from 'erxes-ui/components/on-demand';

/*
 * The currency field and displays load the first time a page shows one: erxes-ui is one chunk
 * every route loads, and only some plugin pages use them.
 */

const field = async () => (await import('./components/CurrencyField')).CurrencyField;
const display = () => import('../display/components/Currency');

/**
 * An amount and its currency: an amount input and a currency picker.
 * `ValueInput` types the amount, `SelectCurrency` picks the currency (from `currencies`, an
 * organisation's), `SelectCurrencyCommand` is the list alone. Its code loads on first use.
 */
export const CurrencyField = Object.assign(
  onDemand(async () => field()),
  {
    ValueInput: onDemand(async () => (await field()).ValueInput),
    SelectCurrency: onDemand(async () => (await field()).SelectCurrency),
    SelectCurrencyCommand: onDemand(async () => (await field()).SelectCurrencyCommand),
  },
);

/**
 * A currency by its code: its icon and name, its icon alone, or its code.
 * `variant` picks which: `label` (the default), `icon` or `code`.
 */
export const CurrencyDisplay = onDemand(async () => (await display()).CurrencyDisplay);

/**
 * An amount after its currency's icon, through `formatAmount`.
 * `kind="short"` shows "1.2k". Without a currency it shows 0, as 3.x did.
 */
export const CurrencyFormatedDisplay = onDemand(
  async () => (await display()).CurrencyFormatedDisplay,
);
