import { useErxesUpload, useRemoveFile } from 'erxes-ui';
import { useCallback, useState } from 'react';

export type TBroadcastAttachment = {
  name: string;
  url: string;
  type: string;
  size: number;
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const toAttachment = ({ name, url, type, size }: TBroadcastAttachment) => ({
  name,
  url,
  type,
  size,
});

// A re-uploaded file replaces the one with the same name
const mergeAttachments = (
  current: TBroadcastAttachment[],
  added: TBroadcastAttachment[],
) => [
  ...current.filter((file) => !added.some(({ name }) => name === file.name)),
  ...added.map(toAttachment),
];

export const isImageAttachment = (attachment: TBroadcastAttachment) =>
  attachment.type.startsWith('image/');

/** The email's attachments: uploading more and removing one from storage. */
export const useBroadcastAttachment = (
  value: TBroadcastAttachment[] | undefined,
  onChange: (files: TBroadcastAttachment[]) => void,
) => {
  const [files, setFiles] = useState<TBroadcastAttachment[]>(value || []);
  const { removeFile, isLoading: removing } = useRemoveFile();

  const uploadProps = useErxesUpload({
    maxFiles: MAX_FILES,
    maxFileSize: MAX_FILE_SIZE,
    onFilesAdded: (addedFiles) => {
      const next = mergeAttachments(files, addedFiles);

      setFiles(next);
      onChange(next);
    },
  });

  const remove = useCallback(
    (name: string) =>
      removeFile(name, (status) => {
        if (status === 'ok') {
          setFiles(files.filter((file) => file.name !== name));
        }
      }),
    [removeFile, files],
  );

  return { files, uploadProps, removing, remove };
};
