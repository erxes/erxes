import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { POS_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY } from '@/ebarimt/settings/pos-in-ebarimt-config/constants';
import { CREATE_MN_CONFIG } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';

export const useCreatePosInEbarimtConfig = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: POS_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createPosInEbarimtConfigMutation, { loading, error }] = useMutation(
    CREATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Pos in ebarimt config created successfully',
          variant: 'default',
        });
        setCursor('');
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  return {
    createPosInEbarimtConfig: createPosInEbarimtConfigMutation,
    loading,
    error,
  };
};
