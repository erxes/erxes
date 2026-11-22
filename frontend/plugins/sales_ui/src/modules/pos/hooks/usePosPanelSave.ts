import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { mutations } from '@/pos/graphql/mutations';
import { type PosEditMutationVariables } from '~/gql/graphql';

export const usePosPanelSave = ({
  successMessage,
  failureMessage,
  onSaved,
}: {
  successMessage: string;
  failureMessage: string;
  onSaved: () => void;
}) => {
  const { t } = useTranslation('sales');
  const [posEdit, { loading }] = useMutation(mutations.posEdit);

  const save = async (variables: PosEditMutationVariables) => {
    try {
      await posEdit({
        variables,
        refetchQueries: ['salesPosSettingsDetail'],
      });
      toast({ title: t('success'), description: successMessage });
      onSaved();
    } catch (e) {
      toast({
        title: t('error'),
        description: e instanceof Error ? e.message : failureMessage,
        variant: 'destructive',
      });
    }
  };

  return { save, saving: loading };
};
