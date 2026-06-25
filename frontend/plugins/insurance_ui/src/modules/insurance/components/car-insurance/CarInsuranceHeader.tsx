import { IconCar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { GenericHeader } from '../shared';

export const CarInsuranceHeader = () => {
  const { t } = useTranslation('insurance');
  return (
    <GenericHeader
      icon={<IconCar />}
      parentLabel={t('insurance')}
      parentLink="/insurance/products"
      currentLabel={t('car-insurance')}
    />
  );
};
