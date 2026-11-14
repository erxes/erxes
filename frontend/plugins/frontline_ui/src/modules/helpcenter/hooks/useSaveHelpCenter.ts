import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { HELP_CENTER_CONFIG_UPDATE } from '@/helpcenter/graphql/mutations/helpCenterConfigUpdate';
import { GET_HELP_CENTERS } from '@/helpcenter/graphql/queries/getHelpCenters';
import { IHelpCenterConfigInput } from '@/helpcenter/types';

export const useSaveHelpCenter = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.helpcenter',
  });

  const [updateConfig, { loading }] = useMutation(HELP_CENTER_CONFIG_UPDATE, {
    refetchQueries: [GET_HELP_CENTERS],
    awaitRefetchQueries: true,
  });

  const saveHelpCenter = (config: IHelpCenterConfigInput) => {
    const isEditing = Boolean(config._id);

    return updateConfig({
      variables: { config },
      onCompleted: ({ helpCenterConfigUpdate }) => {
        if (!helpCenterConfigUpdate) {
          toast({
            title: t('error'),
            description: t('something-went-wrong'),
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: t('success'),
          description: isEditing
            ? t('help-center-saved', 'Help center saved')
            : t('help-center-created', 'Help center created'),
          variant: 'success',
        });
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
