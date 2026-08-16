import { Button, useConfirm } from 'erxes-ui';

import { IconTrash } from '@tabler/icons-react';
import { useRemoveProducts } from '../hooks/mutations/useRemoveProduct';
import { useTranslation } from 'react-i18next';

export const ProductsDelete = ({
  productIds,
  refetch,
}: {
  productIds: string[];
  refetch: () => void;
}) => {
  const { confirm } = useConfirm();
  const { removeProducts } = useRemoveProducts();
  const processId = localStorage.getItem('processId') || '';
  const { t } = useTranslation('sales');

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-products-confirm', { count: productIds.length }),
        }).then(() => {
          removeProducts({
            variables: {
              dataIds: productIds,
              processId,
            },
            onCompleted: () => {
              refetch();
            },
          });
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
