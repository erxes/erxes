import type { FieldContentType } from '@erxes/core-contract';
import { ToggleGroup } from 'erxes-ui';
import { useQueryState } from 'nuqs';

/** Customers / Companies / Products switch for settings that exist per record type (`?type=`). */
export const useContentTypeParam = (): [FieldContentType, (type: FieldContentType) => void] => {
  const [type, setType] = useQueryState('type');

  return [
    type === 'company' || type === 'product' ? type : 'customer',
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
          ['product', 'Products'],
        ] as const
      ).map(([value, label]) => (
        <ToggleGroup.Item key={value} value={value}>
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
