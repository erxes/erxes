import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { FILES_DOWNLOAD_URL } from '../graphql/queries';
import { IFile } from '../types';

export type TFilePreviewKind =
  | 'image'
  | 'pdf'
  | 'sheet'
  | 'docx'
  | 'video'
  | 'audio'
  | 'text'
  | 'none';

const TEXT_PREVIEW_MAX = 1024 * 1024;
export const DOCUMENT_PREVIEW_MAX = 20 * 1024 * 1024;

const SHEET_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];
const DOCX_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const FETCHED_KINDS: TFilePreviewKind[] = ['text', 'sheet', 'docx'];

// Mirrors the backend's canServeInline.
export const getFilePreviewKind = (file: IFile): TFilePreviewKind => {
  const { mimeType } = file;

  if (/^image\/(png|jpeg|gif|webp)$/.test(mimeType)) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (SHEET_TYPES.includes(mimeType) && file.size <= DOCUMENT_PREVIEW_MAX)
    return 'sheet';
  if (mimeType === DOCX_TYPE && file.size <= DOCUMENT_PREVIEW_MAX)
    return 'docx';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    /^(text\/(plain|markdown)|application\/json)$/.test(mimeType) &&
    file.size <= TEXT_PREVIEW_MAX
  ) {
    return 'text';
  }

  return 'none';
};

export const useFilePreview = (file: IFile | null) => {
  const kind = file ? getFilePreviewKind(file) : 'none';
  const inline = !FETCHED_KINDS.includes(kind);
  const [text, setText] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  const { data, loading, error } = useQuery<{ filesDownloadUrl: string }>(
    FILES_DOWNLOAD_URL,
    {
      variables: { _id: file?._id, inline, viewer: kind === 'pdf' },
      skip: !file || kind === 'none',
      fetchPolicy: 'network-only',
    },
  );
  const url = data?.filesDownloadUrl || null;

  useEffect(() => {
    setText(null);
    setTextError(null);

    if (kind !== 'text' || !url) {
      return;
    }

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Storage returned ${res.status}`);
        }

        return res.text();
      })
      .then(setText)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') {
          setTextError(e.message);
        }
      });

    return () => controller.abort();
  }, [kind, url]);

  return {
    kind,
    url,
    canOpenInTab: inline,
    text,
    loading:
      loading || (kind === 'text' && !!url && text === null && !textError),
    error: error?.message || textError,
  };
};
