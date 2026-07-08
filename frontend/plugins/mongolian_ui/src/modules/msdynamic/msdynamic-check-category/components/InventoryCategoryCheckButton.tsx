import { Button } from 'erxes-ui';
import { SelectBrand, SelectCategory } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import { useCheckCategory } from '../hooks/useCheckCategory';

/* Category check hiih button bolon category/brand selector-uudiig haruulna */
export const InventoryCategoryCheckButton = () => {
  const { t } = useTranslation('mongolian');
  const { loading, queryParams, setBrand, setCategory, toCheckCategory } =
    useCheckCategory();

  /* Odoo bish, MS Dynamic category shalgah mutation-iig duudna */
  const handleCheck = async () => {
    await toCheckCategory();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <SelectCategory
        value={queryParams.categoryId || ''}
        placeholder={t('select-category')}
        className="min-w-[200px]"
        mode="single"
        onValueChange={(val) => setCategory(Array.isArray(val) ? val[0] : val)}
      />
      <SelectBrand
        value={queryParams.brandId || ''}
        placeholder={t('select-brand')}
        mode="single"
        onValueChange={(val) => setBrand(Array.isArray(val) ? val[0] : val)}
      />
      <Button onClick={handleCheck} disabled={loading}>
        {loading ? t('checking') : t('check')}
      </Button>
    </div>
  );
};
