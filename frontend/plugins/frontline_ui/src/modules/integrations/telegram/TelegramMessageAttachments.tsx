import { type IAttachment, readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MessageAttachments } from '@/inbox/conversation-messages/components/MessageAttachments';

// Stream uploads require the hosted player rather than a native video source.
export const getTelegramStreamPlayer = (
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

export const TelegramMessageAttachments = ({
  attachments,
}: {
  attachments?: IAttachment[];
}) => {
  const { t } = useTranslation('frontline');
  if (!attachments?.length) return null;
  const media = attachments.map((attachment) => ({
    attachment,
    src: readImage(attachment.url),
    player: attachment.type?.startsWith('video')
      ? getTelegramStreamPlayer(readImage(attachment.url))
      : undefined,
  }));
  return (
    <div className="max-w-full min-w-0 space-y-2">
      {media.some(({ player }) => player) ? (
        media.map(({ attachment, player }, index) =>
          player ? (
            <iframe
              key={`${attachment.url}-${index}`}
              src={player}
              title={attachment.name || t('video', 'Video')}
              className="aspect-video w-96 max-w-full rounded border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <MessageAttachments
              key={`${attachment.url}-${index}`}
              attachments={[attachment]}
            />
          ),
        )
      ) : (
        <MessageAttachments attachments={attachments} />
      )}
      {media
        .filter(
          ({ attachment }) =>
            attachment.url && /^(audio|video)/.test(attachment.type || ''),
        )
        .map(({ attachment, src, player }, index) => (
          <a
            key={`${attachment.url}-${index}`}
            href={player || src}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-96 truncate text-xs text-primary underline"
            title={attachment.name}
          >
            {attachment.name || t('open-attachment', 'Open attachment')}
          </a>
        ))}
    </div>
  );
};
