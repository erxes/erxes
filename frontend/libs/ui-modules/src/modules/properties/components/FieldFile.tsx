import {
  IconFile,
  IconPaperclip,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Dialog,
  IAttachment,
  Spinner,
  readImage,
  useErxesUpload,
  useRemoveFile,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { SpecificFieldProps } from './Field';

const MAX_SIZE = 20 * 1024 * 1024;

const isImage = (file: IAttachment) => file.type?.startsWith('image/');

const parseFiles = (value: unknown): IAttachment[] =>
  (Array.isArray(value) ? value : []).filter((file) => file?.url);

const FileRow = ({
  file,
  removing,
  onRemove,
}: {
  file: IAttachment;
  removing: boolean;
  onRemove: () => void;
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <li className="group flex items-center gap-2 bg-background shadow-xs px-1 border rounded-sm w-full h-8 text-foreground text-sm">
      {isImage(file) ? (
        <>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex flex-1 items-center gap-2 text-left hover:underline truncate"
            title={file.name}
          >
            <img
              src={readImage(file.url)}
              alt={file.name}
              loading="lazy"
              className="border rounded size-6 object-cover shrink-0"
            />
            <span className="truncate">{file.name}</span>
          </button>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <Dialog.Content className="bg-transparent shadow-none p-0 border-0 max-w-fit">
              <Dialog.Title className="sr-only">{file.name}</Dialog.Title>
              <img
                src={readImage(file.url)}
                alt={file.name}
                className="shadow-2xl rounded max-w-[90vw] max-h-[85vh] object-contain"
              />
            </Dialog.Content>
          </Dialog>
        </>
      ) : (
        <a
          href={readImage(file.url, undefined, true)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center gap-2 hover:underline truncate"
          title={file.name}
        >
          <span className="flex justify-center items-center bg-muted border rounded size-6 shrink-0">
            <IconFile size={12} className="text-muted-foreground" />
          </span>
          <span className="flex-1 truncate">{file.name}</span>
        </a>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={removing}
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="opacity-0 group-hover:opacity-100 size-6"
      >
        <IconTrash size={14} />
      </Button>
    </li>
  );
};

export const FieldFile = ({
  value,
  inCell,
  handleChange,
}: SpecificFieldProps) => {
  const files = parseFiles(value);

  const { removeFile, isLoading: removing } = useRemoveFile();

  const uploadProps = useErxesUpload({
    maxFiles: 20,
    maxFileSize: MAX_SIZE,
    onFilesAdded: (added) => handleChange([...files, ...added]),
  });

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      void uploadProps.onUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProps.files.length]);

  const handleRemove = (file: IAttachment) =>
    removeFile(file.name, (status) => {
      if (status === 'ok') {
        handleChange(files.filter((f) => f.url !== file.url));
      }
    });

  if (inCell) {
    return files.length === 0 ? (
      <span className="px-2 text-muted-foreground select-none">—</span>
    ) : (
      <div className="flex items-center gap-1 px-2 text-muted-foreground text-xs">
        <IconFile size={14} />
        {files.length}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <FileRow
              key={file.url}
              file={file}
              removing={removing}
              onRemove={() => handleRemove(file)}
            />
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={uploadProps.loading}
        onClick={uploadProps.open}
        className="justify-start w-full h-8 font-normal text-muted-foreground"
      >
        {uploadProps.loading ? <Spinner /> : <IconPaperclip size={16} />}
        {uploadProps.loading ? '' : 'Upload'}
      </Button>

      {!!uploadProps.errors.length && (
        <p className="text-destructive text-xs">
          {uploadProps.errors[0]?.message || 'Upload failed'}
        </p>
      )}

      <input {...uploadProps.getInputProps()} />
    </div>
  );
};
