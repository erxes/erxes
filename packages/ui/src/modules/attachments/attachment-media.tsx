import { IconDownload, IconPlayerPlayFilled, IconZoomIn } from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';
import { readImage } from 'erxes-ui/utils/core';
import { getCloudflareStreamBase } from 'erxes-ui/utils/videoEmbed';
import { useState } from 'react';
import { Heading, Lightbox, MediaThumbnail, ScrollTrack } from './attachment-parts';
import { useAttachmentContext } from './context';
import type { IAttachment } from './types';
import { useCarousel } from './use-carousel';

/** The attachments whose type starts with `prefix`, and the lightbox state over them. */
const useMedia = (prefix: 'image/' | 'video/') => {
  const { attachments } = useAttachmentContext();
  const [open, setOpen] = useState(false);
  const media = attachments.filter((item) => item.type.startsWith(prefix));
  const carousel = useCarousel(media.length, open);

  const openAt = (index: number) => {
    carousel.show(index);
    setOpen(true);
  };

  return { media, open, setOpen, carousel, openAt, current: media[carousel.index] };
};

type AttachmentPreviewProps = {
  heading?: string;
  className?: string;
  renderThumbnails?: (openPreview: (index: number) => void) => React.ReactNode;
};

/** Image attachments as thumbnails, opening a lightbox. */
export const AttachmentPreview = ({
  heading = 'Media Attachments',
  className,
  renderThumbnails,
}: AttachmentPreviewProps) => {
  const { media, open, setOpen, carousel, openAt, current } = useMedia('image/');

  if (!current) return null;

  return (
    <div className={cn('py-4 px-8', className)}>
      {heading && <Heading>{heading}</Heading>}
      {renderThumbnails ? (
        renderThumbnails(openAt)
      ) : (
        <ScrollTrack label="Media attachments">
          {media.map((attachment, index) => (
            <MediaThumbnail
              key={attachment.url}
              attachment={attachment}
              onOpen={() => openAt(index)}
              className="cursor-zoom-in"
              overlayClassName="opacity-0 group-hover:opacity-100 transition-opacity"
              icon={<IconZoomIn size={28} className="text-primary-foreground" aria-hidden />}
            >
              <img
                className="w-full h-full object-cover rounded-lg"
                src={readImage(attachment.url)}
                alt={attachment.name}
                loading="lazy"
              />
            </MediaThumbnail>
          ))}
        </ScrollTrack>
      )}
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        title={current.name || 'Image preview'}
        kind="image"
        position={carousel.index}
        count={media.length}
        onPrev={carousel.prev}
        onNext={carousel.next}
        actions={
          <Button variant="secondary" size="icon" aria-label="Download file" asChild>
            <a
              target="_blank"
              rel="noreferrer"
              href={readImage(current.url)}
              className="absolute top-20 -right-4 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full z-50 transition-colors"
            >
              <IconDownload />
            </a>
          </Button>
        }
      >
        <img
          key={current.url}
          src={readImage(current.url)}
          alt={current.name}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl select-none"
          draggable={false}
        />
      </Lightbox>
    </div>
  );
};

const VideoPlayer = ({ attachment }: { attachment: IAttachment }) => {
  const streamBase = getCloudflareStreamBase(attachment.url);

  if (streamBase) {
    return (
      <iframe
        className="w-[80vw] max-w-3xl aspect-video rounded shadow-2xl"
        src={`${streamBase}/iframe`}
        title={attachment.name}
        // oxlint-disable-next-line react/iframe-missing-sandbox -- the Cloudflare Stream player is cross-origin, so allow-same-origin keeps its own origin (its storage) and cannot lift the sandbox
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    );
  }

  return (
    <video
      className="max-w-[90vw] max-h-[90vh] rounded shadow-2xl"
      src={readImage(attachment.url)}
      controls
      autoPlay
    >
      <track kind="captions" />
    </video>
  );
};

type AttachmentVideoProps = {
  heading?: string;
};

/** Video attachments as thumbnails (Cloudflare Stream or the first frame), opening a player. */
export const AttachmentVideo = ({ heading = 'Video Attachments' }: AttachmentVideoProps) => {
  const { media, open, setOpen, carousel, openAt, current } = useMedia('video/');

  if (!current) return null;

  return (
    <div className="py-4 px-8">
      <Heading>{heading}</Heading>
      <ScrollTrack label="Video attachments">
        {media.map((attachment, index) => {
          const streamBase = getCloudflareStreamBase(attachment.url);

          return (
            <MediaThumbnail
              key={attachment.url}
              attachment={attachment}
              onOpen={() => openAt(index)}
              className="bg-black overflow-hidden"
              overlayClassName="group-hover:bg-background/40 transition-colors"
              icon={
                <IconPlayerPlayFilled size={28} className="text-primary-foreground" aria-hidden />
              }
            >
              {streamBase ? (
                <img
                  className="w-full h-full object-cover rounded-lg"
                  src={`${streamBase}/thumbnails/thumbnail.jpg`}
                  alt={attachment.name}
                  loading="lazy"
                />
              ) : (
                <video
                  className="w-full h-full object-cover rounded-lg"
                  src={readImage(attachment.url)}
                  preload="metadata"
                  muted
                />
              )}
            </MediaThumbnail>
          );
        })}
      </ScrollTrack>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        title={current.name || 'Video'}
        kind="video"
        position={carousel.index}
        count={media.length}
        onPrev={carousel.prev}
        onNext={carousel.next}
      >
        <VideoPlayer key={current.url} attachment={current} />
      </Lightbox>
    </div>
  );
};
