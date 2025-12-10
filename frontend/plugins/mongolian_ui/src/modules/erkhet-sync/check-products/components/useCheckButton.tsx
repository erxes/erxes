import { Button } from 'erxes-ui';
import { useCheckProduct } from '../hooks/useCheckProduct';

const CheckButton = () => {
  const { checkProduct, loading } = useCheckProduct();

  const handleCheck = async () => {
    await checkProduct();
  };

  return (
    <Button onClick={handleCheck} disabled={loading}>
      {loading ? 'Checking...' : 'Check'}
    </Button>
  );
};

export default CheckButton;
