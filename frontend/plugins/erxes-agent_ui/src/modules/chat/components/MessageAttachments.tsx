import { IconFileText } from '@tabler/icons-react';
import { ChatAttachment } from '~/modules/chat/types';
import {
  attachmentSrc,
  formatFileSize,
  isImageAttachment,
} from '~/modules/chat/lib/attachments';

// Attachments render as their own block OUTSIDE the chat bubble — images as
// standalone rounded cards, other files as download cards.
export const MessageAttachments = ({
  attachments,
}: {
  attachments: ChatAttachment[];
}) => {
  const images = attachments.filter(isImageAttachment);
  const files = attachments.filter((a) => !isImageAttachment(a));

  return (
    <div className="flex flex-col items-end gap-1.5 max-w-[78%]">
      {images.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5">
          {images.map((att, i) => (
            <a
              key={`${att.url}-${i}`}
              href={attachmentSrc(att)}
              target="_blank"
              rel="noreferrer"
              title={att.name}
              className="group/img block overflow-hidden rounded-xl border border-border bg-muted shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
            >
              <img
                src={attachmentSrc(att)}
                alt={att.name}
                className="block max-h-64 max-w-72 h-auto w-auto transition-transform duration-300 group-hover/img:scale-[1.02]"
              />
            </a>
          ))}
        </div>
      )}
      {files.map((att, i) => (
        <a
          key={`${att.url}-${i}`}
          href={attachmentSrc(att)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-sm hover:border-primary/40 hover:bg-primary/4 transition-colors max-w-64"
        >
          <span className="size-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconFileText className="size-4 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">
              {att.name}
            </span>
            {att.size ? (
              <span className="block text-muted-foreground mt-0.5">
                {formatFileSize(att.size)}
              </span>
            ) : null}
          </span>
        </a>
      ))}
    </div>
  );
};
