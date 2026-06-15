import { Button } from 'erxes-ui';

import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';

/** Check button trigger with matched count display */
export const MSDynamicCheckProductsCheckButton = () => {
  const { checkProducts, checking, productsData } = useMSDynamicCheckProducts();

  return (
    <div className="flex items-center gap-3">
      {typeof productsData?.matched?.count === 'number' && (
        <div className="text-sm text-muted-foreground">
          Matched: {productsData.matched.count}
        </div>
      )}
      <Button onClick={checkProducts} disabled={checking}>
        {checking ? 'Checking...' : 'Check'}
      </Button>
    </div>
  );
};
