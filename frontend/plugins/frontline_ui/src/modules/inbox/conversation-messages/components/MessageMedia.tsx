import { useState } from 'react';
import { Alert, type IAttachment, readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// Same Stream player used by erxes-ui Attachments.Video. That component owns
// attachment removal, so conversation history uses a read-only media view.
export const getMessageStreamPlayer = (
  location: string,
): string | undefined => {
  try {
    const url = new URL(location);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !/^customer-[a-z0-9]+\.cloudflarestream\.com$/.test(url.hostname)
    )
      return undefined;
    const id = url.pathname.split('/')[1];
    if (!id || !/^[a-zA-Z0-9._-]+$/.test(id)) return undefined;
    return `${url.origin}/${id}/iframe`;
  } catch {
    return undefined;
  }
};

export const MessageMedia = ({ attachment }: { attachment: IAttachment }) => {
  const { t } = useTranslation('frontline');
  const [failed, setFailed] = useState(false);
  const src = readImage(attachment.url);
  const player = getMessageStreamPlayer(src);
  const isAudio = attachment.type?.startsWith('audio/');
  return (
    <div className="w-96 max-w-full min-w-0 space-y-2 rounded-lg border bg-background p-2">
      {player ? (
        <iframe
          src={player}
          title={attachment.name || t('video', 'Video')}
          className="aspect-video w-full min-w-0 rounded border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : isAudio ? (
        <audio
          src={src}
          controls
          preload="metadata"
          className="w-full min-w-0"
          onError={() => setFailed(true)}
        >
          <track kind="captions" />
        </audio>
      ) : (
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="max-h-96 w-full min-w-0 rounded"
          onError={() => setFailed(true)}
        >
          <track kind="captions" />
        </video>
      )}
      {failed && (
        <Alert variant="destructive">
          <Alert.Description>
            {t(
              'media-playback-failed',
              'This browser could not play the file. Open it below to download or view it.',
            )}
          </Alert.Description>
        </Alert>
      )}
      <a
        href={player || src}
        target="_blank"
        rel="noopener noreferrer"
        className="block truncate text-xs text-primary underline"
        title={attachment.name}
      >
        {attachment.name || t('open-attachment', 'Open attachment')}
      </a>
    </div>
  );
};
