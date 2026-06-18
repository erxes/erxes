import { Button } from 'erxes-ui';
import { useCheckProduct } from '../hooks/useCheckProduct';

const CheckButton = () => {
  const { checkProduct, loading, toCheckProductsData } = useCheckProduct();

  const handleCheck = async () => {
    await checkProduct();
  };

  return (
    <div className="flex items-center gap-3">
      {typeof toCheckProductsData?.matched?.count === 'number' && (
        <div className="text-sm text-muted-foreground">
          Matched: {toCheckProductsData.matched.count}
        </div>
      )}
      <Button onClick={handleCheck} disabled={loading}>
        {loading ? 'Checking...' : 'Check'}
      </Button>
    </div>
  );
};

export default CheckButton;
