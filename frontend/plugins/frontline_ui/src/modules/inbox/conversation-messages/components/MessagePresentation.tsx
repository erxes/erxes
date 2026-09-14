import { IconPhotoOff } from '@tabler/icons-react';
import { isSameDay } from 'date-fns';

export const MessageDaySeparator = ({
  createdAt,
  previousCreatedAt,
}: {
  createdAt: string;
  previousCreatedAt?: string;
}) => {
  if (
    previousCreatedAt &&
    isSameDay(new Date(previousCreatedAt), new Date(createdAt))
  ) {
    return null;
  }

  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <time dateTime={createdAt}>
        {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          new Date(createdAt),
        )}
      </time>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
};

export const UnsupportedMessage = ({ text }: { text: string }) => (
  <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
    <IconPhotoOff className="size-4 shrink-0" />
    <span>{text}</span>
  </div>
);
