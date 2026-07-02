import { SheetNavSidebar } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ProductCreateSidebar = () => {
  const { t } = useTranslation('product');
  return (
    <SheetNavSidebar
      tabs={['overview', 'properties']}
      groupLabel={t('general', 'General')}
    />
  );
};
