import { useEffect, useRef, useState } from 'react';
import { Dialog, BlockEditorReadOnly, cn } from 'erxes-ui';
import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';

export const MessageContent = ({
  content,
  internal,
}: {
  content?: string;
  internal?: boolean;
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewerFailed, setViewerFailed] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageRef.current) return;

    const images = messageRef.current.getElementsByTagName('img');

    Array.from(images).forEach((img) => {
      img.style.cursor = 'pointer';
      img.onclick = () => setSelectedImage(img.src);
    });
  }, [content]);

  return (
    <>
      {!!content && (
        <BlockEditorReadOnly
          content={content}
          className={cn('read-only', internal && 'internal-note')}
          ref={messageRef}
        />
      )}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
          setViewerFailed(false);
        }}
      >
        <Dialog.Content className="!flex !h-auto !max-h-[92vh] !w-auto !max-w-[94vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
          {selectedImage && !viewerFailed && (
            <InboxImage
              src={selectedImage}
              alt="Full size"
              onError={() => setViewerFailed(true)}
              className="block h-auto max-h-[88vh] w-auto max-w-[90vw] rounded-lg object-contain"
            />
          )}
          {viewerFailed && (
            <div className="rounded-lg bg-background px-6 py-8 text-sm text-muted-foreground shadow-lg">
              Image unavailable
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    </>
  );
};
