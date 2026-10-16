import { Button, Popover, Skeleton, isDefined } from 'erxes-ui';
import { useFacebookPost } from '../hooks/useFacebookPost';
import DOMPurify from 'dompurify';
import { IconBrowserShare, IconExternalLink } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const FacebookPostTrigger = ({ erxesApiId }: { erxesApiId: string }) => {
  const { t } = useTranslation('frontline');
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
            attachments
              .filter(isDefined)
              .map((attachment) => (
                <img
                  key={attachment}
                  src={attachment}
                  alt={attachment}
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
          <a
            href={permalink_url ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('view-post')} <IconExternalLink />
          </a>
        </Button>
      </Popover.Content>
    </Popover>
  );
};
