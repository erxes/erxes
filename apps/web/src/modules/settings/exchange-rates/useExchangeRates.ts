import type { ExchangeRate } from '@erxes/core-contract';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCursorList } from '~/lib/cursorList';

const EXCHANGE_RATES_CURSOR_SESSION_KEY = 'exchangeRates_cursor';

/** The list's search: either currency, from the address (`searchValue`). */
export const useExchangeRateSearch = () => useQueryState('searchValue', parseAsString);

/** The organisation's rates, newest first, 30 at a time. */
export const useExchangeRates = () => {
  const [searchValue] = useExchangeRateSearch();
  const filters = { searchValue: searchValue || undefined };

  return useCursorList<ExchangeRate>({
    sessionKey: EXCHANGE_RATES_CURSOR_SESSION_KEY,
    filters,
    options: (paging) =>
      orpc.exchangeRates.list.infiniteOptions({
        input: (page) => ({ ...page, ...filters }),
        ...paging,
      }),
  });
};

/** Toasts a failed change, and reads the list again after one. */
const useRateChange = () => {
  const client = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });

  return {
    onSettled: () => client.invalidateQueries({ queryKey: orpc.exchangeRates.key() }),
    onError: (error: Error) =>
      toast({ variant: 'destructive', title: t('error', 'Error'), description: messageOf(error) }),
    success: (description: string) =>
      toast({ variant: 'success', title: t('success', 'Success'), description }),
  };
};

export const useSaveExchangeRate = () => {
  const { onSettled, onError, success } = useRateChange();
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });

  const create = useMutation(
    orpc.exchangeRates.create.mutationOptions({
      onSettled,
      onError,
      onSuccess: () => success(t('exchange-rate-created', 'Exchange rate created')),
    }),
  );

  const update = useMutation(
    orpc.exchangeRates.update.mutationOptions({
      onSettled,
      onError,
      onSuccess: () => success(t('exchange-rate-updated', 'Exchange rate updated')),
    }),
  );

  return { create, update, saving: create.isPending || update.isPending };
};

/** Deletes rates after a confirmation, as 3.x did. */
export const useRemoveExchangeRates = () => {
  const { onSettled, onError, success } = useRateChange();
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });

  return useMutation(
    orpc.exchangeRates.remove.mutationOptions({
      onSettled,
      onError,
      onSuccess: ({ removed }) =>
        success(
          removed > 1
            ? t('exchange-rates-deleted', 'Exchange rates deleted')
            : t('exchange-rate-deleted', 'Exchange rate deleted'),
        ),
    }),
  );
};
