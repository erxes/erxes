import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRemoveHelpCenters } from './useRemoveHelpCenters';
import type { IHelpCenter } from '@/helpcenter/types';

export const useConfirmRemoveHelpCenter = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.helpcenter',
  });
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeHelpCenters, loading } = useRemoveHelpCenters();

  const confirmRemoveHelpCenter = async (
    helpCenter: Pick<IHelpCenter, '_id' | 'title'>,
  ): Promise<void> => {
    try {
      await confirm({
        message: t('kb-confirm-delete-topic', {
          title: helpCenter.title || t('unnamed-topic'),
        }),
      });
    } catch {
      return;
    }
    try {
      await removeHelpCenters([helpCenter._id]);
      toast({
        title: t('success'),
        variant: 'success',
        description: t('kb-topic-deleted', 'Help center deleted'),
      });
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('something-went-wrong'),
        variant: 'destructive',
      });
    }
  };

  return { confirmRemoveHelpCenter, loading };
};
