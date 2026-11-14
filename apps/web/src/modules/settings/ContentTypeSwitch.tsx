import type { ContentType } from '@erxes/core-contract';
import { ToggleGroup } from 'erxes-ui';
import { useQueryState } from 'nuqs';

/** Customers / Companies switch for settings that exist per record type (`?type=`). */
export const useContentTypeParam = (): [ContentType, (type: ContentType) => void] => {
  const [type, setType] = useQueryState('type');

  return [
    type === 'company' ? 'company' : 'customer',
    (next) => void setType(next === 'customer' ? null : next),
  ];
};

export const ContentTypeSwitch = () => {
  const [type, setType] = useContentTypeParam();

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      value={[type]}
      onValueChange={([next]) => {
        if (next) setType(next);
      }}
    >
      {(
        [
          ['customer', 'Customers'],
          ['company', 'Companies'],
        ] as const
      ).map(([value, label]) => (
        <ToggleGroup.Item key={value} value={value}>
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
