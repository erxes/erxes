import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { needsToRefreshState } from '@/properties/states/needsToRefresh';

export const usePropertyFormFeedback = ({
  mode,
  isCurrent,
  onClose,
}: {
  mode: 'add' | 'edit';
  isCurrent: () => boolean;
  onClose: () => void;
}): { onCompleted: () => void; onError: (error: Error) => void } => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);
  return {
    onCompleted: () => {
      if (!isCurrent()) return;
      toast({
        title:
          mode === 'add'
            ? t('property-added', 'Property added')
            : t('property-updated', 'Property updated'),
        variant: 'success',
      });
      setNeedsToRefresh(true);
      onClose();
    },
    onError: (error) =>
      toast({
        title: t('error', 'Error'),
        variant: 'destructive',
        description: error.message,
      }),
  };
};
