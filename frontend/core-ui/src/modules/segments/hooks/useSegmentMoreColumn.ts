import { useConfirm, useQueryState, useToast } from 'erxes-ui';
import { TFunction } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveSegments } from './useRemoveSegments';

type TUsageAutomation = { _id: string; name?: string };

const usageDescriptionOf = (t: TFunction, automations: TUsageAutomation[]) => {
  if (!automations.length) {
    return t('delete-undone');
  }

  return t('delete-in-use', {
    total: automations.length,
    names: automations
      .map((automation) => automation.name || automation._id)
      .join(', '),
  });
};

/**
 * A segment row's menu: opening it, and deleting it after a confirm that
 * names the automations still using it.
 */
export const useSegmentMoreColumn = (segmentId: string, name?: string) => {
  const { t } = useTranslation('segment');
  const [, setSegmentId] = useQueryState<string>('segmentId');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeSegments, readUsage } = useRemoveSegments();

  const edit = useCallback(
    () => setSegmentId(segmentId),
    [setSegmentId, segmentId],
  );

  const describeUsage = useCallback(async () => {
    try {
      const [usage] = await readUsage([segmentId]);

      return usageDescriptionOf(t, usage?.automations || []);
    } catch {
      return t('delete-usage-unknown');
    }
  }, [readUsage, segmentId, t]);

  const remove = useCallback(async () => {
    try {
      await removeSegments([segmentId]);
      toast({
        title: t('success'),
        variant: 'success',
        description: t('segment-deleted'),
      });
    } catch (e) {
      toast({
        title: t('error'),
        description: (e as Error).message,
        variant: 'destructive',
      });
    }
  }, [removeSegments, segmentId, toast, t]);

  const requestDelete = useCallback(async () => {
    if (!segmentId) {
      toast({
        title: t('error'),
        description: t('segment-id-missing'),
        variant: 'destructive',
      });
      return;
    }

    const description = await describeUsage();

    confirm({
      message: t('delete-confirm', { name }),
      options: {
        description,
        confirmationValue: 'delete',
        okLabel: t('delete'),
      },
    }).then(remove);
  }, [segmentId, toast, t, describeUsage, confirm, name, remove]);

  return { edit, requestDelete };
};
