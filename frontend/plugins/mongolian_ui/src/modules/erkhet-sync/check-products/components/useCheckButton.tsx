import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckProduct } from '../hooks/useCheckProduct';

const CheckButton = () => {
  const { checkProduct, loading, toCheckProductsData } = useCheckProduct();
  const { t } = useTranslation('mongolian');

  const handleCheck = async () => {
    await checkProduct();
  };

  return (
    <div className="flex items-center gap-3">
      {typeof toCheckProductsData?.matched?.count === 'number' && (
        <div className="text-sm text-muted-foreground">
          {t('matched')}: {toCheckProductsData.matched.count}
        </div>
      )}
      <Button onClick={handleCheck} disabled={loading}>
        {loading ? t('checking') : t('check')}
      </Button>
    </div>
  );
};

export default CheckButton;
