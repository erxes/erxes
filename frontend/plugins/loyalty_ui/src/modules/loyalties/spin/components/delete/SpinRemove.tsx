import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { DELETE_SPIN_MUTATION } from '@/loyalties/spin/graphql/mutations/mutations';
import { ISpin } from '@/loyalties/spin/types/spin';

export const SpinRemove = ({
  spinIds,
  rows,
}: {
  spinIds: string[];
  rows: Row<ISpin>[];
}) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const [deleteSpin] = useMutation(DELETE_SPIN_MUTATION, {
    refetchQueries: ['SpinsMain'], // matches query name in SPINS_QUERY
  });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-spin-confirm', { count: spinIds.length }),
        }).then(async () => {
          try {
            await deleteSpin({ variables: { _ids: spinIds } });
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: t('success'),
              variant: 'success',
              description: t('spins-deleted', { count: spinIds.length }),
            });
          } catch (e: unknown) {
            toast({
              title: t('error'),
              description: e instanceof Error ? e.message : String(e),
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
