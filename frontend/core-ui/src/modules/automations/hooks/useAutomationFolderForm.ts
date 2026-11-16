import { useAutomationFolderMutations } from '@/automations/hooks/useAutomationFolderMutations';
import { IAutomationFolder } from '@/automations/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const folderFormSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export type TAutomationFolderForm = z.infer<typeof folderFormSchema>;

/** Creates a folder, or renames the one given. */
export const useAutomationFolderForm = ({
  folder,
  open,
  onDone,
}: {
  folder?: IAutomationFolder;
  open: boolean;
  onDone: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { addFolder, editFolder, saving } = useAutomationFolderMutations();
  const form = useForm<TAutomationFolderForm>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: { name: folder?.name || '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: folder?.name || '' });
    }
  }, [open, folder, form]);

  const submit = form.handleSubmit(async ({ name }) => {
    const result = folder
      ? await editFolder({ variables: { _id: folder._id, name } })
      : await addFolder({ variables: { name } });

    if (result.errors?.length || !result.data) {
      return;
    }

    toast({
      title: folder ? t('folder-renamed') : t('folder-created'),
      variant: 'success',
    });
    onDone();
  });

  return { form, submit, saving };
};
