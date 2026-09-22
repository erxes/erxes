import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { HELP_CENTER_CONFIG_UPDATE } from '@/helpcenter/graphql/mutations/helpCenterConfigUpdate';
import { GET_HELP_CENTERS } from '@/helpcenter/graphql/queries/getHelpCenters';
import { IHelpCenterConfigInput } from '@/helpcenter/types';

export const useSaveHelpCenter = ({ onSaved }: { onSaved: () => void }) => {
  const { t } = useTranslation('frontline');

  const [updateConfig, { loading }] = useMutation(HELP_CENTER_CONFIG_UPDATE, {
    refetchQueries: [GET_HELP_CENTERS],
    awaitRefetchQueries: true,
  });

  const saveHelpCenter = (config: IHelpCenterConfigInput) => {
    const isEditing = !!config._id;

    return updateConfig({
      variables: { config },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: isEditing
            ? t('kb-topic-saved', 'Topic saved')
            : t('kb-topic-created', 'Topic created'),
          variant: 'success',
        });
        onSaved();
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { saveHelpCenter, loading };
};
