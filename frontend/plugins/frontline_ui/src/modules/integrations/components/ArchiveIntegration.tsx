import { Spinner, toast, useConfirm } from 'erxes-ui';
import { IconArchive } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { ARCHIVE_INTEGRATION } from '@/integrations/graphql/mutations/ArchiveIntegration';
import { useTranslation } from 'react-i18next';

export const ArchiveIntegration = ({
  _id,
  name,
  isActive,
}: {
  _id: string;
  name: string;
  isActive: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const [archiveIntegration, { loading }] = useMutation(ARCHIVE_INTEGRATION, {
    refetchQueries: ['Integrations'],
    onCompleted() {
      toast({
        title: isActive ? t('integration-archived') : t('integration-unarchived'),
        variant: 'default',
      });
    },
    onError(e) {
      toast({
        title: isActive ? t('failed-to-archive-integration') : t('failed-to-unarchive-integration'),
        description: e?.message,
        variant: 'destructive',
      });
    },
  });

  const handleArchive = () => {
    confirm({
      message: isActive
        ? t('confirm-archive-integration', { name })
        : t('confirm-unarchive-integration', { name }),
    }).then(() => {
      archiveIntegration({ variables: { id: _id, status: isActive } });
    });
  };

  return (
    <div onClick={handleArchive} className="flex items-center gap-2 w-full">
      {loading ? (
        <Spinner className="size-4 text-primary" />
      ) : (
        <IconArchive size={16} />
      )}
      {isActive ? t('archive') : t('unarchive')}
    </div>
  );
};
