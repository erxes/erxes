import { Button } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSimilarityConfig } from '@/products/settings/components/productsConfig/similarityConfig/SimilarityConfigContext';

export const SimilarityConfigForm = () => {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const { handleAddGroup } = useSimilarityConfig();

  return (
    <Button onClick={handleAddGroup}>
      <IconPlus />
      {t('add-group')}
    </Button>
  );
};
