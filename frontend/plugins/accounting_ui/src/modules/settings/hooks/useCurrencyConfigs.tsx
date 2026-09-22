import { gql, useQuery } from '@apollo/client';
import { CURRENCY_CODES } from 'erxes-ui/constants';
import type { CurrencyCode } from 'erxes-ui/types';
import { useMemo } from 'react';

const SYSTEM_CONFIGS_BY_CODE = gql`
  query AccountingSystemConfigsByCode($codes: [String]) {
    configsByCode(codes: $codes) {
      code
      value
    }
  }
`;

type Config = {
  code: string;
  value?: string | string[] | null;
};

type SystemConfigsByCodeResponse = {
  configsByCode: Config[];
};

type SystemConfigsByCodeVariables = {
  codes: string[];
};

const toCurrencyList = (value?: string | string[] | null): string[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
};

const toCurrencyOptions = (currencies: string[]) =>
  Object.fromEntries(
    currencies
      .filter(
        (currency): currency is CurrencyCode => currency in CURRENCY_CODES,
      )
      .map((currency) => [currency, CURRENCY_CODES[currency]]),
  ) as typeof CURRENCY_CODES;

export const getCurrencyCodeFromOptions = (
  value: string | undefined,
  currencies: typeof CURRENCY_CODES,
) => (value && value in currencies ? (value as CurrencyCode) : undefined);

export const useCurrencyConfigs = () => {
  const { data } = useQuery<
    SystemConfigsByCodeResponse,
    SystemConfigsByCodeVariables
  >(SYSTEM_CONFIGS_BY_CODE, {
    variables: { codes: ['dealCurrency', 'mainCurrency'] },
    fetchPolicy: 'cache-first',
  });

  const configsByCode = useMemo(
    () =>
      Object.fromEntries(
        (data?.configsByCode || []).map((config) => [
          config.code,
          config.value,
        ]),
      ) as Record<string, string | string[] | null | undefined>,
    [data?.configsByCode],
  );

  const dealCurrencyOptions = useMemo(
    () => toCurrencyOptions(toCurrencyList(configsByCode.dealCurrency)),
    [configsByCode.dealCurrency],
  );

  const mainCurrency = toCurrencyList(configsByCode.mainCurrency)[0];

  return {
    dealCurrencyOptions,
    mainCurrency: mainCurrency ?? 'MNT',
  };
};
