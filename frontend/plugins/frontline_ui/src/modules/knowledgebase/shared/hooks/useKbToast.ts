import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useKbToast = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();

  const success = (description: string) =>
    toast({ title: t('success'), description, variant: 'success' });

  const failure = (error: unknown) =>
    toast({
      title: t('error'),
      description:
        error instanceof Error ? error.message : t('something-went-wrong'),
      variant: 'destructive',
    });

  const run = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> => {
    try {
      await action();
      success(successMessage);

      return true;
    } catch (error: unknown) {
      failure(error);

      return false;
    }
  };

  return { success, failure, run };
};
