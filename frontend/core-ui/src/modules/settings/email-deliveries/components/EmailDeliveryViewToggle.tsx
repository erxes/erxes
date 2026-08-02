import { ToggleGroup, useMultiQueryState } from 'erxes-ui';

export type TEmailDeliveryView = 'messages' | 'addresses' | 'limits';

const VIEWS: { value: TEmailDeliveryView; label: string }[] = [
  { value: 'messages', label: 'Messages' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'limits', label: 'Limits' },
];

/** Reads/writes the `view` query param that swaps the email delivery views. */
export const useEmailDeliveryView = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ view: string }>([
    'view',
  ]);

  const view: TEmailDeliveryView = VIEWS.some(
    (option) => option.value === queryParams.view,
  )
    ? (queryParams.view as TEmailDeliveryView)
    : 'messages';

  const setView = (next: TEmailDeliveryView) =>
    // Keep the default view out of the URL
    setQueryParams({ view: next === 'messages' ? null : next });

  return { view, setView };
};

export const EmailDeliveryViewToggle = () => {
  const { view, setView } = useEmailDeliveryView();

  return (
    <ToggleGroup
      type="single"
      value={view}
      // Radix reports an empty value when the pressed item is toggled off, and
      // one of the views always has to be showing.
      onValueChange={(next) => next && setView(next as TEmailDeliveryView)}
      variant="outline"
      className="h-8"
    >
      {VIEWS.map(({ value, label }) => (
        <ToggleGroup.Item key={value} value={value}>
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
