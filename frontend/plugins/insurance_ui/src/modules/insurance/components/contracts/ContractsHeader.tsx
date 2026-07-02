import { IconFileText } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { GenericHeader } from '../shared';

export const ContractsHeader = () => {
  const { t } = useTranslation('insurance');
  return (
    <GenericHeader
      icon={<IconFileText />}
      parentLabel={t('insurance')}
      parentLink="/insurance/products"
      currentLabel={t('contracts')}
    />
  );
};
