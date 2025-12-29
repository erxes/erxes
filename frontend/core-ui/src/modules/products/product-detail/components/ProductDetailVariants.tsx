import { InfoCard } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ProductDetailVariants = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  return (
    <InfoCard
      title={t('product-variants')}
      description="Manage product variants"
    >
      <InfoCard.Content>
        <div className="space-y-4"></div>
      </InfoCard.Content>
    </InfoCard>
  );
};
