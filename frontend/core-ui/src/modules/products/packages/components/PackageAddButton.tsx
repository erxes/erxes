import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, useSidePanel } from 'ui-modules';
import { PACKAGE_CONTENT_TYPE } from '../constants/packageContentType';

/**
 * Opens a new package in the side panel as a draft; it is created on Create
 * there, then shown as the package.
 */
export const PackageAddButton = () => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const { openNewRecord } = useSidePanel();

  return (
    <Can action="productsCreate">
      <Button onClick={() => openNewRecord(PACKAGE_CONTENT_TYPE)}>
        <IconPlus />
        {t('new-package', 'New package')}
      </Button>
    </Can>
  );
};
