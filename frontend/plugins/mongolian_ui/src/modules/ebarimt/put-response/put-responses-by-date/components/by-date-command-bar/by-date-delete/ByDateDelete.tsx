import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useRemoveByDate } from '~/modules/ebarimt/put-response/put-responses-by-date/detail/hooks/useRemoveByDate';

export const ByDateDelete = ({ byDateIds }: { byDateIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeByDate } = useRemoveByDate();
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-by-date-confirm', { count: byDateIds.length }),
        }).then(() => {
          removeByDate(byDateIds, {
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
