import { Button, Popover, ScrollArea, Skeleton } from 'erxes-ui';
import { useFacebookPost } from '../hooks/useFacebookPost';
import DOMPurify from 'dompurify';
import { IconBrowserShare, IconExternalLink } from '@tabler/icons-react';
import { useMemo } from 'react';

export const FacebookPostTrigger = ({ erxesApiId }: { erxesApiId: string }) => {
  const { post, loading } = useFacebookPost({ erxesApiId });
  const { content, attachments, permalink_url } = post || {};

  const sanitized = useMemo(
    () => (content ? DOMPurify.sanitize(content) : ''),
    [content],
  );

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          disabled={loading}
          variant="ghost"
          className="font-normal text-muted-foreground"
        >
          <IconBrowserShare />
          {loading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span
              className="flex-auto max-w-32 truncate"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-96 overflow-hidden flex flex-col max-h-96">
        <div className="overflow-y-auto flex-1">
          <div dangerouslySetInnerHTML={{ __html: sanitized }} />
          {!!attachments?.length &&
            attachments.map((attachment) => (
              <img
                key={attachment.url}
                src={attachment.url}
                alt={attachment.url}
                loading="lazy"
              />
            ))}
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full mt-3 flex-none"
          asChild
        >
          <a href={permalink_url} target="_blank" rel="noopener noreferrer">
            View post <IconExternalLink />
          </a>
        </Button>
      </Popover.Content>
    </Popover>
  );
};
