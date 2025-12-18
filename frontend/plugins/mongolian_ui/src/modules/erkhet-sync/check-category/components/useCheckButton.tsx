import { Button } from 'erxes-ui';
import { useCheckCategory } from '../hooks/useCheckCategory';

const CheckButton = () => {
  const { checkCategory, loading } = useCheckCategory();

  const handleCheck = async () => {
    await checkCategory();
  };

  return (
    <Button onClick={handleCheck} disabled={loading}>
      {loading ? 'Checking...' : 'Check'}
    </Button>
  );
};

export default CheckButton;
