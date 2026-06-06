import { useCPUsersVerify } from '@/contacts/client-portal-users/hooks/useClientPortalUserVerify';
import { ApolloError } from '@apollo/client';
import { IconCheck } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';

interface IProps {
  clientIds: string[];
  type: 'email' | 'phone';
}

export const CPUsersVerify = ({ clientIds, type }: IProps) => {
  const { confirm } = useConfirm();
  const { cpUsersVerify, loading } = useCPUsersVerify();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();

  const label = type === 'email' ? 'Verify user email' : 'Verify user phone';

  const handleVerify = () => {
    confirm({
      message: `Are you sure you want to verify ${type} for the ${clientIds.length} selected clients?`,
    }).then(() => {
      cpUsersVerify({
        variables: {
          type,
          userIds: clientIds,
        },
        onError: (e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: 'Success',
            variant: 'success',
            description: `${label} successfully`,
          });
        },
      });
    });
  };

  return (
    <Button variant="secondary" onClick={handleVerify} disabled={loading}>
      <IconCheck size={18} />
      {label}
    </Button>
  );
};
