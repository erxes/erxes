import { IconExternalLink } from '@tabler/icons-react';
import { Avatar, cn } from 'erxes-ui';
import {
  getFacebookPagePictureUrl,
  getFacebookPageUrl,
} from '@/integrations/facebook/utils/pageLinks';

/** A page's avatar and name, opening the page on Facebook in a new tab. */
export const FacebookPageLink = ({
  pageId,
  name,
  className,
}: {
  pageId: string;
  name?: string | null;
  className?: string;
}) => (
  <a
    href={getFacebookPageUrl(pageId)}
    target="_blank"
    rel="noreferrer"
    onClick={(e) => e.stopPropagation()}
    className={cn(
      'group/page flex min-w-0 items-center gap-2 hover:underline',
      className,
    )}
  >
    <Avatar className="size-5 shrink-0">
      <Avatar.Image src={getFacebookPagePictureUrl(pageId)} />
      <Avatar.Fallback>{(name || pageId).charAt(0)}</Avatar.Fallback>
    </Avatar>
    <span className="truncate">{name || pageId}</span>
    <IconExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover/page:opacity-100" />
  </a>
);
