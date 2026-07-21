import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckCategory } from '../hooks/useCheckCategory';

const CheckButton = () => {
  const { t } = useTranslation('mongolian');
  const { checkCategory, loading } = useCheckCategory();

  const handleCheck = async () => {
    await checkCategory();
  };

  return (
    <Button onClick={handleCheck} disabled={loading}>
      {loading ? t('checking', 'Checking...') : t('check', 'Check')}
    </Button>
  );
};

export default CheckButton;
