import { IconDownload, IconPaperclip } from '@tabler/icons-react';
import { Button, Spinner, readImage } from 'erxes-ui';
import { useState } from 'react';

import type { IAgentsFileMeta } from '../agentsFiles';

const Attachment = ({ file }: { file: IAgentsFileMeta }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const openFile = (): void => {
    window.open(readImage(file.url), '_blank', 'noopener,noreferrer');
  };

  if (file.type.startsWith('image/') && !failed) {
    return (
      <Button
        type="button"
        variant="ghost"
        aria-label={`Open ${file.name}`}
        title={file.name}
        className="relative h-auto w-64 max-w-full overflow-hidden rounded-lg p-0"
        onClick={openFile}
      >
        {!loaded && (
          <span
            role="status"
            aria-label="Loading image"
            className="absolute inset-0 flex items-center justify-center"
          >
            <Spinner />
          </span>
        )}
        <img
          src={readImage(file.url)}
          alt={file.name}
          loading="lazy"
          className={`block max-h-72 w-full object-contain ${loaded ? '' : 'min-h-32 opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      title={failed ? 'Image preview unavailable. Open the original file.' : undefined}
      className="h-auto inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[12px] hover:bg-muted"
      onClick={openFile}
    >
      <IconPaperclip className="size-3.5 shrink-0" />
      <span className="truncate">{file.name}</span>
      <IconDownload className="size-3.5 shrink-0" />
    </Button>
  );
};

export const AttachedFiles = ({
  files,
  notice,
}: {
  files: IAgentsFileMeta[];
  notice: string;
}) => (
  <div className="mt-1.5 space-y-1">
    <ul className="flex flex-col gap-1">
      {files.map((file) => (
        <li key={file.url}>
          <Attachment file={file} />
        </li>
      ))}
    </ul>
    {notice ? (
      <p className="text-[11px] text-muted-foreground">{notice}</p>
    ) : null}
  </div>
);
