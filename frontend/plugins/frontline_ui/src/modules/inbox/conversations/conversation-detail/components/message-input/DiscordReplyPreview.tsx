import { IconArrowBackUp, IconX } from '@tabler/icons-react';

interface DiscordReplyPreviewProps {
  preview: string;
  onCancel: () => void;
}

export const DiscordReplyPreview = ({
  preview,
  onCancel,
}: DiscordReplyPreviewProps) => (
  <div className="mx-6 mb-1 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
    <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
      <IconArrowBackUp className="size-4 flex-none" />
      <span className="truncate">Replying to: {preview}</span>
    </div>
    <button
      type="button"
      aria-label="Cancel reply"
      onClick={onCancel}
      className="flex-none text-muted-foreground hover:text-foreground"
    >
      <IconX size={14} aria-hidden="true" />
    </button>
  </div>
);
