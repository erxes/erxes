import { IconCloudUpload, IconRefresh } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useCheckProduct } from '../hooks/useCheckProduct';

const CheckProductActions = () => {
  const {
    checkProduct,
    syncProducts,
    loading,
    syncLoading,
    filteredProducts,
    toCheckProducts,
    toCheckProductsData,
  } = useCheckProduct();

  const hasActionable = (filteredProducts?.length ?? 0) > 0;
  const hasChecked = !!toCheckProducts;
  const matchedCount = toCheckProductsData?.matched?.count;

  return (
    <div className="flex items-center gap-3">
      {typeof matchedCount === 'number' && (
        <div className="text-sm text-muted-foreground">
          Matched: {matchedCount}
        </div>
      )}
      {hasChecked && (
        <Button
          variant="secondary"
          onClick={syncProducts}
          disabled={syncLoading || loading || !hasActionable}
        >
          <IconCloudUpload size={16} />
          {syncLoading ? 'Syncing...' : 'Sync'}
        </Button>
      )}
      <Button onClick={checkProduct} disabled={loading || syncLoading}>
        <IconRefresh size={16} />
        {loading ? 'Checking...' : 'Check'}
      </Button>
    </div>
  );
};

export default CheckProductActions;
