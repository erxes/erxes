import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IFile } from 'ui-modules';
import { z } from 'zod';
import { useFilesPage } from '../context/FilesPageContext';
import { TFilesAccessInput, useFilesActions } from './useFilesActions';

export const FILES_ACCESS_TIERS = [
  'inherit',
  'private',
  'organization',
  'selected',
] as const;

export type TFilesAccessTier = (typeof FILES_ACCESS_TIERS)[number];

const TIER_ACCESS: Record<TFilesAccessTier, TFilesAccessInput> = {
  inherit: {},
  private: { restricted: true },
  organization: { access: [{ type: 'everyone', role: 'viewer' }] },
  selected: { restricted: true },
};

// Mirrors the backend name rule.
const nameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .refine((value) => !/[/\\]/.test(value)),
  tier: z.enum(FILES_ACCESS_TIERS),
});

type TNameForm = z.infer<typeof nameSchema>;

// The server keeps the extension on rename.
const splitFileName = ({ name, ext }: IFile) => {
  const suffix = ext ? `.${ext}` : '';

  return suffix && name.toLowerCase().endsWith(suffix.toLowerCase())
    ? { base: name.slice(0, -suffix.length), suffix }
    : { base: name, suffix };
};

export const useFilesNameForm = () => {
  const { t } = useTranslation('files');
  const {
    browser,
    nameDialog,
    setNameDialog,
    previewFile,
    setPreviewFile,
    setAccessTarget,
  } = useFilesPage();
  const { addFolder, renameFolder, renameFile, loading } = useFilesActions();

  const form = useForm<TNameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: '', tier: 'inherit' },
  });

  const fileName =
    nameDialog?.mode === 'rename-file' ? splitFileName(nameDialog.file) : null;
  const suffix = fileName?.suffix || '';

  useEffect(() => {
    if (!nameDialog) {
      return;
    }

    form.reset({
      tier: 'inherit',
      name:
        nameDialog.mode === 'rename-file'
          ? splitFileName(nameDialog.file).base
          : nameDialog.mode === 'rename-folder'
          ? nameDialog.folder.name
          : '',
    });
  }, [nameDialog, form]);

  const onSubmit = form.handleSubmit(async ({ name: typed, tier }) => {
    if (!nameDialog) {
      return;
    }

    const name =
      nameDialog.mode === 'rename-file' ? `${typed}${suffix}` : typed;

    if (nameDialog.mode === 'create-folder') {
      const result = await addFolder(name, browser.folderId, TIER_ACCESS[tier]);
      const created = result.data?.filesFolderAdd;

      if (result.errors || !created) {
        return;
      }

      setNameDialog(null);

      if (tier === 'selected') {
        setAccessTarget({ itemType: 'folder', _id: created._id });
      }

      return;
    }

    const result =
      nameDialog.mode === 'rename-folder'
        ? await renameFolder(nameDialog.folder._id, name)
        : await renameFile(nameDialog.file._id, name);

    if (result.errors) {
      return;
    }

    if (
      nameDialog.mode === 'rename-file' &&
      previewFile?._id === nameDialog.file._id
    ) {
      setPreviewFile({ ...previewFile, name });
    }

    setNameDialog(null);
  });

  return {
    form,
    open: !!nameDialog,
    close: () => setNameDialog(null),
    title: nameDialog?.mode === 'create-folder' ? t('new-folder') : t('rename'),
    nameError: t('invalid-name'),
    isCreate: nameDialog?.mode === 'create-folder',
    tiers: FILES_ACCESS_TIERS,
    suffix,
    onSubmit,
    loading,
  };
};
