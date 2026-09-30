import { useMultiQueryState } from 'erxes-ui';

type TEmailDeliveryView = 'messages' | 'addresses' | 'limits';

const VIEWS: TEmailDeliveryView[] = ['messages', 'addresses', 'limits'];

export const useEmailDeliveryView = () => {
  const [queryParams] = useMultiQueryState<{ view: string }>(['view']);

  const view: TEmailDeliveryView = VIEWS.some(
    (option) => option === queryParams.view,
  )
    ? (queryParams.view as TEmailDeliveryView)
    : 'messages';

  return { view };
};
