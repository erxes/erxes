import { formatBytes, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  filesCanManage,
  IFile,
  useFileDownload,
  useFilesUpload,
} from 'ui-modules';
import { useFilesPage } from '../context/FilesPageContext';
import { useFilesActions } from './useFilesActions';
import { useFilesPreviewMode } from './useFilesPreviewMode';
import { useFilesShare } from './useFilesShare';
import { useFilesVersions } from './useFilesVersions';

export type TFilesPreviewTab = 'preview' | 'versions';

const TABS: TFilesPreviewTab[] = ['preview', 'versions'];

const TONES: [RegExp, string][] = [
  [/pdf/, 'bg-red-500/10 text-red-600 dark:text-red-400'],
  [/sheet|excel|csv/, 'bg-green-500/10 text-green-600 dark:text-green-400'],
  [
    /presentation|powerpoint/,
    'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  ],
  [/word|document|text/, 'bg-blue-500/10 text-blue-600 dark:text-blue-400'],
  [/^image\//, 'bg-violet-500/10 text-violet-600 dark:text-violet-400'],
  [/^(video|audio)\//, 'bg-pink-500/10 text-pink-600 dark:text-pink-400'],
];

const toneOf = (mimeType: string) =>
  TONES.find(([pattern]) => pattern.test(mimeType))?.[1] ||
  'bg-muted text-muted-foreground';

const metaOf = (file: IFile, edited: string) =>
  [
    (file.ext || file.mimeType.split('/').pop() || '').toUpperCase(),
    formatBytes(file.size, 1),
    file.updatedAt && edited,
  ]
    .filter(Boolean)
    .join(' · ');

export const useFilesPreviewPanel = () => {
  const { t } = useTranslation('files');
  const { confirm } = useConfirm();
  const {
    previewFile,
    setPreviewFile,
    setNameDialog,
    setMoveTarget,
    setAccessTarget,
  } = useFilesPage();
  const [tab, setTab] = useState<TFilesPreviewTab>('preview');
  const { remove } = useFilesActions();
  const { isSplit, toggleMode } = useFilesPreviewMode();
  const { download } = useFileDownload();
  const { upload } = useFilesUpload();
  // Functional update: the upload may finish after the sheet changed.
  const keepFresh = (file: IFile) =>
    setPreviewFile((current) =>
      current?._id === file._id ? { ...current, ...file } : current,
    );
  const versions = useFilesVersions(previewFile?._id, keepFresh);
  const canManage = filesCanManage(previewFile?.myRole);
  const share = useFilesShare(canManage ? previewFile?._id : undefined);

  const close = () => {
    setPreviewFile(null);
    setTab('preview');
  };

  return {
    file: previewFile,
    isSplit,
    toggleMode,
    tone: previewFile ? toneOf(previewFile.mimeType) : '',
    meta: previewFile
      ? metaOf(
          previewFile,
          t('edited-on', {
            date: previewFile.updatedAt
              ? new Date(previewFile.updatedAt).toLocaleDateString()
              : '',
          }),
        )
      : '',
    changeTab: (value: string) => {
      const next = TABS.find((candidate) => candidate === value);

      if (next) {
        setTab(next);
      }
    },
    open: !!previewFile,
    close,
    tab,
    setTab,
    versions,
    share,
    canManage,
    publicLink: canManage ? !!share.share : !!previewFile?.publicLink,
    download: (versionId?: string) =>
      previewFile && download(previewFile._id, versionId),
    replace: (files: File[]) =>
      previewFile &&
      files[0] &&
      upload([files[0]], undefined, keepFresh, previewFile._id),
    shareWithPeople: () =>
      previewFile &&
      setAccessTarget({ itemType: 'file', _id: previewFile._id }),
    rename: () =>
      previewFile && setNameDialog({ mode: 'rename-file', file: previewFile }),
    move: () =>
      previewFile &&
      setMoveTarget({
        fileIds: [previewFile._id],
        folderIds: [],
        label: previewFile.name,
      }),
    trash: () =>
      previewFile &&
      confirm({ message: t('trash-confirm', { name: previewFile.name }) }).then(
        async () => {
          const result = await remove({ fileIds: [previewFile._id] });

          if (!result.errors) {
            close();
          }
        },
      ),
  };
};
