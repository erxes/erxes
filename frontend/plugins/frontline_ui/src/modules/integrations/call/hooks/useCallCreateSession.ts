import { useMutation } from '@apollo/client';
import { ADD_ACTIVE_SESSION } from '@/integrations/call/graphql/mutations/callMutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCallCreateSession = () => {
  const { t } = useTranslation('frontline');
  const [createActiveSession, { loading }] = useMutation(ADD_ACTIVE_SESSION, {
    onError: (e) => {
      toast({
        title: t('something-went-wrong-creating-session'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createActiveSession,
    loading,
  };
};
