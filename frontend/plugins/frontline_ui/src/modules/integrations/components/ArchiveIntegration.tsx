import { Spinner, toast, useConfirm } from 'erxes-ui';
import { IconArchive } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { ARCHIVE_INTEGRATION } from '@/integrations/graphql/mutations/ArchiveIntegration';

export const ArchiveIntegration = ({
  _id,
  name,
  isActive,
}: {
  _id: string;
  name: string;
  isActive: boolean;
}) => {
  const { confirm } = useConfirm();
  const [archiveIntegration, { loading }] = useMutation(ARCHIVE_INTEGRATION, {
    refetchQueries: ['Integrations'],
    onCompleted() {
      toast({
        title: isActive ? 'Integration archived' : 'Integration unarchived',
        variant: 'default',
      });
    },
    onError(e) {
      toast({
        title: `Failed to ${isActive ? 'archive' : 'unarchive'} integration`,
        description: e?.message,
        variant: 'destructive',
      });
    },
  });

  const handleArchive = () => {
    confirm({
      message: `Are you sure you want to ${
        isActive ? 'archive' : 'unarchive'
      } "${name}" integration?`,
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
      {isActive ? 'Archive' : 'Unarchive'}
    </div>
  );
};
