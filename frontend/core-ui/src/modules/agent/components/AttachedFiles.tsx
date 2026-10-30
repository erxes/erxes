import { Button, Spinner, readImage } from 'erxes-ui';
import { useState } from 'react';

import type { IAgentsFileMeta } from '../agentsFiles';
import { AgentAttachmentCard } from './AgentAttachmentCard';

const openFile = (file: IAgentsFileMeta): void => {
  window.open(readImage(file.url), '_blank', 'noopener,noreferrer');
};

const ImageAttachment = ({
  file,
  compact,
}: {
  file: IAgentsFileMeta;
  /** Several images share the row as square tiles. */
  compact: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <AgentAttachmentCard
        name={file.name}
        mimeType={file.type}
        size={file.size}
        onOpen={() => openFile(file)}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={`Open ${file.name}`}
      title={file.name}
      className={`relative h-auto max-w-full overflow-hidden rounded-xl border bg-background/60 p-0 hover:bg-background/60 hover:opacity-90 ${
        compact ? 'size-28' : 'w-64'
      }`}
      onClick={() => openFile(file)}
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
        className={`block w-full ${
          compact ? 'h-full object-cover' : 'max-h-72 object-contain'
        } ${loaded ? '' : `${compact ? '' : 'min-h-32'} opacity-0`}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </Button>
  );
};

export const AttachedFiles = ({
  files,
  notice,
}: {
  files: IAgentsFileMeta[];
  notice: string;
}) => {
  const images = files.filter((file) => file.type.startsWith('image/'));
  const documents = files.filter((file) => !file.type.startsWith('image/'));

  return (
    <div className="mt-1.5 space-y-1.5">
      {images.length > 0 && (
        <ul aria-label="Attached images" className="flex flex-wrap gap-1.5">
          {images.map((file) => (
            <li key={file.url} className="max-w-full">
              <ImageAttachment file={file} compact={images.length > 1} />
            </li>
          ))}
        </ul>
      )}
      {documents.length > 0 && (
        <ul aria-label="Attached files" className="flex flex-wrap gap-1.5">
          {documents.map((file) => (
            <li key={file.url} className="min-w-0 max-w-full">
              <AgentAttachmentCard
                name={file.name}
                mimeType={file.type}
                size={file.size}
                onOpen={() => openFile(file)}
              />
            </li>
          ))}
        </ul>
      )}
      {notice ? (
        <p className="text-[11px] text-muted-foreground">{notice}</p>
      ) : null}
    </div>
  );
};
