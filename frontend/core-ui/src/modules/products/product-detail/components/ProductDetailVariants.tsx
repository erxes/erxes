import { Button, Collapsible, InfoCard, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFieldGroups, FieldsInGroup } from 'ui-modules';
import { useProductDetailWithQuery } from '../hooks/useProductDetailWithQuery';
import { useProductCustomFieldEdit } from '../hooks/useProductCustomFieldEdit';

export const ProductDetailVariants = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const { productDetail } = useProductDetailWithQuery();
  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: 'core:product',
  });

  if (fieldGroupsLoading) {
    return (
      <InfoCard title={t('product-properties')}>
        <InfoCard.Content>
          <Spinner containerClassName="py-6" />
        </InfoCard.Content>
      </InfoCard>
    );
  }

  if (!productDetail) {
    return null;
  }

  return (
    <InfoCard title={t('product-properties')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-4 pr-4">
          {fieldGroups.map((group) => (
            <Collapsible key={group._id} className="group" defaultOpen>
              <Collapsible.Trigger asChild>
                <Button variant="secondary" className="justify-start w-full">
                  <Collapsible.TriggerIcon />
                  {group.name}
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content className="pt-4">
                <FieldsInGroup
                  group={group}
                  id={productDetail._id}
                  contentType="core:product"
                  customFieldsData={productDetail.customFieldsData || {}}
                  mutateHook={useProductCustomFieldEdit}
                />
              </Collapsible.Content>
            </Collapsible>
          ))}
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
