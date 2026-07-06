import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteAssignment } from '../../../hooks/useDeleteAssignment';

export const DeleteAssignment = ({
  assignmentIds,
}: {
  assignmentIds: string[];
}) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { removeAssignment } = useDeleteAssignment();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-assignment-confirm', 'Are you sure you want to delete {{count}} selected assignment(s)?', { count: assignmentIds.length }),
        }).then(() => {
          removeAssignment({
            variables: { _ids: assignmentIds },
          })
            .then(() => {
              toast({
                title: t('assignments-deleted', '{{count}} assignment(s) deleted successfully', { count: assignmentIds.length }),
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
