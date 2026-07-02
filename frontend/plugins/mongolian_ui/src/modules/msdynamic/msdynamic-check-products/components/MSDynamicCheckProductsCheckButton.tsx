import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';

/** Check button trigger with matched count display */
export const MSDynamicCheckProductsCheckButton = () => {
  const { t } = useTranslation('mongolian');
  const { checkProducts, checking, productsData } = useMSDynamicCheckProducts();

  return (
    <div className="flex items-center gap-3">
      {typeof productsData?.matched?.count === 'number' && (
        <div className="text-sm text-muted-foreground">
          {t('matched-count', { count: productsData.matched.count })}
        </div>
      )}
      <Button onClick={checkProducts} disabled={checking}>
        {checking ? t('checking') : t('check')}
      </Button>
    </div>
  );
};
