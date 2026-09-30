import { useMultiQueryState } from 'erxes-ui';

const VIEWS = ['messages', 'addresses', 'limits'] as const;

type TEmailDeliveryView = (typeof VIEWS)[number];

const isEmailDeliveryView = (
  value: string | null | undefined,
): value is TEmailDeliveryView =>
  (VIEWS as readonly string[]).includes(value ?? '');

export const useEmailDeliveryView = () => {
  const [queryParams] = useMultiQueryState<{ view: string }>(['view']);

  const view: TEmailDeliveryView = isEmailDeliveryView(queryParams.view)
    ? queryParams.view
    : 'messages';

  return { view };
};
