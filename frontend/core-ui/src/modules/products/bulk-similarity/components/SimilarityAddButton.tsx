import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, useSidePanel } from 'ui-modules';
import { SIMILARITY_CONTENT_TYPE } from '../constants/similarityContentType';

/**
 * Opens a new similarity group in the side panel as a draft; it is created
 * on Create there, then shown as the group.
 */
export const SimilarityAddButton = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { openNewRecord } = useSidePanel();

  return (
    <Can action="productsCreate">
      <Button onClick={() => openNewRecord(SIMILARITY_CONTENT_TYPE)}>
        <IconPlus />
        {t('new-similarity', 'New similarity')}
      </Button>
    </Can>
  );
};
