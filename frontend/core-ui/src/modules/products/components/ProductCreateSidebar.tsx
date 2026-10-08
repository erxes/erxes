import { useTranslation } from 'react-i18next';
import { SheetNavSidebar } from 'ui-modules';

export const ProductCreateSidebar = () => {
  const { t } = useTranslation('product', { keyPrefix: 'add' });

  return (
    <SheetNavSidebar
      tabs={['overview', 'properties']}
      groupLabel={t('general')}
    />
  );
};
