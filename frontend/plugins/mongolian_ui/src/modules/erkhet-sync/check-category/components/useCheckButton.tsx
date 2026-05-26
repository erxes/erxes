import { IconRefresh, IconCloudUpload } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useCheckCategory } from '../hooks/useCheckCategory';

const CheckCategoryActions = () => {
  const {
    checkCategory,
    syncCategories,
    loading,
    syncLoading,
    filteredCategories,
    toCheckCategories,
  } = useCheckCategory();

  const hasActionable = (filteredCategories?.length ?? 0) > 0;
  const hasChecked = !!toCheckCategories;

  return (
    <div className="flex items-center gap-2">
      {hasChecked && (
        <Button
          variant="secondary"
          onClick={syncCategories}
          disabled={syncLoading || loading || !hasActionable}
        >
          <IconCloudUpload size={16} />
          {syncLoading ? 'Syncing...' : 'Sync'}
        </Button>
      )}
      <Button onClick={checkCategory} disabled={loading || syncLoading}>
        <IconRefresh size={16} />
        {loading ? 'Checking...' : 'Check'}
      </Button>
    </div>
  );
};

export default CheckCategoryActions;
