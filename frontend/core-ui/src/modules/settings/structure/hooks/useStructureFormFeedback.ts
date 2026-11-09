import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useStructureFormFeedback = ({
  isCurrent,
  message,
  onSuccess,
}: {
  isCurrent: () => boolean;
  message: string;
  onSuccess: () => void;
}): { onCompleted: () => void; onError: (error: Error) => void } => {
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  return {
    onCompleted: () => {
      if (!isCurrent()) return;
      toast({ title: t('success'), variant: 'success', description: message });
      onSuccess();
    },
    onError: (error) =>
      toast({
        title: t('error'),
        variant: 'destructive',
        description: error.message,
      }),
  };
};
