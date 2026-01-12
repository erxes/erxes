import { Label } from 'erxes-ui';
import { SelectTags } from 'ui-modules';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const CustomerDetailSelectTag = ({
  tagIds,
  customerId,
}: {
  tagIds: string[];
  customerId: string;
}) => {
  const [tagIdsValue, setTagIdsValue] = useState<string[]>(tagIds);
  const { t } = useTranslation('contact', {
    keyPrefix: 'customer.detail',
  });
  return (
    <fieldset className="space-y-2 px-8">
      <Label asChild>
        <legend>{t('tags')}</legend>
      </Label>
      <SelectTags.Detail
        mode="multiple"
        tagType="core:customer"
        value={tagIdsValue}
        targetIds={[customerId]}
        onValueChange={(value) => {
          setTagIdsValue(value as string[]);
        }}
        options={(newSelectedTagIds) => ({
          update: (cache) => {
            cache.modify({
              id: cache.identify({
                __typename: 'Customer',
                _id: customerId,
              }),
              fields: { tagIds: () => newSelectedTagIds },
              optimistic: true,
            });
          },
        })}
      />
    </fieldset>
  );
};
