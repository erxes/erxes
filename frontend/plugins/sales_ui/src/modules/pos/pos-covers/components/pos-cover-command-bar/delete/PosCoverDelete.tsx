import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useRemovePosCover } from '../../../hooks/usePosCoverRemove';

export const PosCoverDelete = ({ productIds }: { productIds: string[] }) => {
  const { t } = useTranslation('sales');
  const { confirm } = useConfirm();
  const { removePosCover } = useRemovePosCover();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-pos-cover-confirm', { count: productIds.length }),
        }).then(() => {
          removePosCover(productIds, {
            onCompleted: () => {
              toast({
                title: t('success'),
                description: t('pos-cover-deleted', { count: productIds.length }),
              });
            },
            onError: (e: ApolloError) => {
              toast({
                title: t('error'),
                description: e.message,
                variant: 'destructive',
              });
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
