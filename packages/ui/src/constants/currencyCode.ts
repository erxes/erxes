import type { CURRENCY_CODES } from './CurrencyCodes';

/** An ISO 4217 code `CURRENCY_CODES` lists (`'MNT'`, `'USD'`). */
export type CurrencyCode = keyof typeof CURRENCY_CODES;

// The codes alone, so checking one costs the shared chunk no names or icons: those load with
// the currency field, or a page imports `erxes-ui/constants/CurrencyCodes`.
const CODES = new Set(
  `AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BRL BSD BTN BWP BYN
  BZD CAD CDF CHF CLP CNY COP CRC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS
  GIP GMD GNF GTQ GYD HKD HNL HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW
  KWD KYD KZT LAK LBP LKR LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MYR MZN NAD
  NGN NIO NOK NPR NZD OMR PAB PEN PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD
  SHP SLE SOS SRD SSP STN SVC SYP SZL THB TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD UYU UZS VES
  VND VUV WST XCD YER ZAR ZMW ZWG`.split(/\s+/),
);

/** Whether `code` is a currency `CURRENCY_CODES` lists; narrows its type. */
export const isCurrencyCode = (code: string | null | undefined): code is CurrencyCode =>
  CODES.has(code ?? '');
