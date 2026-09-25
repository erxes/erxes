import { useEmailTemplateMutations } from '@/emailTemplates/hooks/useEmailTemplateMutations';
import { renderEmailHtml, useToast } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/** Keeps the email being written as a template. Resolves whether it saved. */
export const useBroadcastSaveAsTemplate = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { toast } = useToast();
  const { getValues } = useFormContext();
  const { addEmailTemplate, loading } = useEmailTemplateMutations();

  const save = async (name: string): Promise<boolean> => {
    const contentJson = getValues('email.contentJson');
    let saved = false;

    await addEmailTemplate({
      variables: {
        name,
        contentJson,
        content: await renderEmailHtml(contentJson),
        contentFormat: 'maily',
      },
      onCompleted: () => {
        saved = true;
        toast({
          variant: 'default',
          title: t('saveAsTemplateSuccess', { name }),
        });
      },
      onError: (error) =>
        toast({ variant: 'destructive', title: error.message }),
    });

    return saved;
  };

  return { save, loading };
};
