import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useRemovePutResponse } from '~/modules/ebarimt/put-response/detail/hooks/useRemovePutResponse';

export const PutResponseDelete = ({ productIds }: { productIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removePutResponse } = useRemovePutResponse();
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-put-response-confirm', { count: productIds.length }),
        }).then(() => {
          removePutResponse(productIds, {
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
