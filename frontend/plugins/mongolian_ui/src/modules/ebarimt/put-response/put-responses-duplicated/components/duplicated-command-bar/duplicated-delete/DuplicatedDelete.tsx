import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveDuplicated } from '~/modules/ebarimt/put-response/put-responses-duplicated/detail/hooks/useRemoveDuplicated';
import { useTranslation } from 'react-i18next';

export const DuplicatedDelete = ({
  duplicatedIds,
}: {
  duplicatedIds: string[];
}) => {
  const { t } = useTranslation('mongolian');
  const { confirm } = useConfirm();
  const { removeDuplicated } = useRemoveDuplicated();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-duplicated-confirm', { count: duplicatedIds.length }),
        }).then(() => {
          removeDuplicated(duplicatedIds, {
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
