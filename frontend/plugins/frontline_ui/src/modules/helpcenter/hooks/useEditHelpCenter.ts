import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { HELP_CENTER_CONFIG_UPDATE } from '@/helpcenter/graphql/mutations/helpCenterConfigUpdate';
import { IHelpCenter, IHelpCenterConfigInput } from '@/helpcenter/types';
import { toHelpCenterConfigInput } from '@/helpcenter/utils/toHelpCenterConfigInput';

export type THelpCenterPatch = Partial<IHelpCenterConfigInput>;

export const useEditHelpCenter = () => {
  const { t } = useTranslation('frontline');
  const [updateConfig, { loading }] = useMutation(HELP_CENTER_CONFIG_UPDATE);

  const editHelpCenter = (helpCenter: IHelpCenter, patch: THelpCenterPatch) => {
    const config: IHelpCenterConfigInput = {
      ...toHelpCenterConfigInput(helpCenter),
      ...patch,
    };

    if (
      patch.ticketChannelId !== undefined &&
      patch.ticketChannelId !== helpCenter.ticketChannelId
    ) {
      config.ticketPipelineId = '';
      config.ticketStatusId = '';
    }

    if (
      patch.ticketPipelineId !== undefined &&
      patch.ticketPipelineId !== helpCenter.ticketPipelineId
    ) {
      config.ticketStatusId = '';
    }

    if (!config.title) {
      toast({
        title: t('error'),
        description: t('kb-topic-needs-title', 'A help center needs a name.'),
        variant: 'destructive',
      });
      return;
    }

    return updateConfig({
      variables: { config },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('kb-topic-saved', 'Help center saved'),
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

  return { editHelpCenter, loading };
};
