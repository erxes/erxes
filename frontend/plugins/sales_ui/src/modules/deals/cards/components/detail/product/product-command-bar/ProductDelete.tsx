import { Button, useConfirm } from 'erxes-ui';

import { IconTrash } from '@tabler/icons-react';
import { useRemoveProducts } from '../hooks/useRemoveProduct';

export const ProductsDelete = ({
  productIds,
  refetch,
  dealId,
}: {
  productIds: string[];
  refetch: () => void;
  dealId: string;
}) => {
  const { confirm } = useConfirm();
  const { removeProducts } = useRemoveProducts();
  const processId = localStorage.getItem('processId');

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            productIds.length
          } selected product${productIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          removeProducts({
            variables: {
              dataIds: productIds,
              dealId,
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
      Delete
    </Button>
  );
};
