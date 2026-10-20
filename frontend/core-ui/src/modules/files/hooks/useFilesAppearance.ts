import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FILES_FOLDER_APPEARANCE_MANY,
  IFile,
  IFilesFolderAppearance,
} from 'ui-modules';
import { useFilesPage } from '../context/FilesPageContext';

export const FILES_FOLDER_COLORS = [
  '#64748b',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
];

export const isCoverImage = (file: IFile) =>
  /^image\/(png|jpeg|gif|webp)$/.test(file.mimeType);

export const useFilesAppearance = () => {
  const { t } = useTranslation('files');
  const { appearanceFolders, setAppearanceFolders, selection } = useFilesPage();
  const single = appearanceFolders.length === 1 ? appearanceFolders[0] : null;
  const close = () => setAppearanceFolders([]);
  const [draft, setDraft] = useState<IFilesFolderAppearance>({});
  const [coverName, setCoverName] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [save, { loading }] = useMutation(FILES_FOLDER_APPEARANCE_MANY, {
    refetchQueries: ['FilesFolders', 'FilesPins'],
    onCompleted: () => {
      toast({ title: t('appearance-saved'), variant: 'success' });
      close();
      selection.clear();
    },
    onError: (error) =>
      toast({
        title: t('action-failed'),
        description: error.message,
        variant: 'destructive',
      }),
  });

  useEffect(() => {
    setDraft(single?.appearance || {});
    setCoverName(null);
  }, [single, appearanceFolders.length]);

  return {
    title: single
      ? t('appearance-title', { name: single.name })
      : t('appearance-title-many', { count: appearanceFolders.length }),
    open: !!appearanceFolders.length,
    close,
    draft,
    coverName,
    hasCover: !!draft.coverFileId,
    setColor: (color: string | null) => setDraft((d) => ({ ...d, color })),
    setIcon: (icon: string | null) => setDraft((d) => ({ ...d, icon })),
    pickerOpen,
    setPickerOpen,
    pickCover: (files: IFile[]) => {
      if (files[0]) {
        setDraft((d) => ({ ...d, coverFileId: files[0]._id }));
        setCoverName(files[0].name);
      }
    },
    removeCover: () => {
      setDraft((d) => ({ ...d, coverFileId: null }));
      setCoverName(null);
    },
    loading,
    submit: () =>
      !!appearanceFolders.length &&
      save({
        variables: {
          _ids: appearanceFolders.map((folder) => folder._id),
          color: draft.color || undefined,
          icon: draft.icon || undefined,
          coverFileId: draft.coverFileId || undefined,
        },
      }),
  };
};
