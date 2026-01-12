import { useMutation } from '@apollo/client';
import { CREATE_EBARIMT_RETURN_CONFIG } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/mutations/createEbarimtReturnConfig';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { EBARIMT_RETURN_CONFIG_CURSOR_SESSION_KEY } from '@/ebarimt/settings/stage-in-return-ebarimt-config/constants';

export const useCreateEbarimtReturnConfig = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: EBARIMT_RETURN_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createEbarimtReturnConfigMutation, { loading, error }] = useMutation(
    CREATE_EBARIMT_RETURN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Ebarimt return config created successfully',
          variant: 'default',
        });
        setCursor(null);
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
    createEbarimtReturnConfig: createEbarimtReturnConfigMutation,
    loading,
    error,
  };
};
