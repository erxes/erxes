import { ToggleGroup, useMultiQueryState } from 'erxes-ui';

export type TEmailDeliveryView = 'messages' | 'addresses' | 'limits';

const VIEWS: { value: TEmailDeliveryView; label: string }[] = [
  { value: 'messages', label: 'Messages' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'limits', label: 'Limits' },
];

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
    setQueryParams({ view: next === 'messages' ? null : next });

  return { view, setView };
};

export const EmailDeliveryViewToggle = () => {
  const { view, setView } = useEmailDeliveryView();

  return (
    <ToggleGroup
      type="single"
      value={view}
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
