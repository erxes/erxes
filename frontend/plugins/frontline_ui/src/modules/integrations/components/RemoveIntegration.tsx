import { toast, useConfirm } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { REMOVE_INTEGRATION } from '@/integrations/graphql/mutations/RemoveIntegration';
import { useMutation } from '@apollo/client';

export const RemoveIntegration = ({
  _id,
  name,
}: {
  _id: string;
  name: string;
}) => {
  const [removeIntegration, { loading }] = useMutation(REMOVE_INTEGRATION, {
    refetchQueries: ['Integrations'],
    onCompleted() {
      toast({
        title: 'Integration removed',
        variant: 'default',
      });
    },
    onError(e) {
      toast({
        title: 'Failed to remove integration',
        description: e?.message,
        variant: 'destructive',
      });
    },
  });

  const { confirm } = useConfirm();

  const handleRemove = () => {
    confirm({
      message: `Are you sure you want to remove "${name}" integration?`,
    }).then(() => {
      removeIntegration({ variables: { id: _id } });
    });
  };

  return (
    <div
      onClick={handleRemove}
      className="flex items-center gap-2 w-full text-destructive"
    >
      {loading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
      ) : (
        <IconTrash size={16} />
      )}
      Remove
    </div>
  );
};
