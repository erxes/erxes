import { useClientPortalRemove } from '@/client-portal/hooks/useClientPortalRemove';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ClientPortalRemove = ({
  clientPortalIds,
  rows,
}: {
  clientPortalIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('client-portal');
  const { confirm } = useConfirm();
  const { removeClientPortal } = useClientPortalRemove();

  const { toast } = useToast();
  return (
    <Can action="clientPortalManage">
      <Button
        variant="destructive"
        onClick={() =>
          confirm({
            message: `Are you sure you want to delete the ${clientPortalIds.length} selected client portal?`,
          }).then(async () => {
            try {
              await removeClientPortal(clientPortalIds);
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: t('success', 'Success'),
                variant: 'success',
                description: t('client-portal-deleted-successfully', 'Client portal deleted successfully'),
              });
            } catch (e: any) {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            }
          })
        }
      >
        <IconTrash />
        {t('delete', 'Delete')}
      </Button>
    </Can>
  );
};
