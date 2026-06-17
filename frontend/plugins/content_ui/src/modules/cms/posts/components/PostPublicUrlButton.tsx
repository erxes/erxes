import { Button, Tooltip, useToast } from 'erxes-ui';
import { IconExternalLink } from '@tabler/icons-react';
import { buildPostPublicUrl, type PostUrlSource } from '../../shared/utils';
import type { IWebsite } from '../../types';
import type { MouseEvent } from 'react';

interface PublicPostUrlButtonPost extends PostUrlSource {
  status?: string | null;
}

interface PostPublicUrlButtonProps {
  post: PublicPostUrlButtonPost;
  cmsConfig?: IWebsite;
  iconOnly?: boolean;
}

const getPublicPostLinkTooltip = (isPublished: boolean, publicUrl: string) => {
  if (isPublished && publicUrl) {
    return 'Open on site';
  }

  if (isPublished) {
    return 'Set public URL and post identifier';
  }

  return 'Publish post before opening on site';
};

export const PostPublicUrlButton = ({
  post,
  cmsConfig,
  iconOnly,
}: PostPublicUrlButtonProps) => {
  const isPublished = post.status === 'published';
  const publicUrl = isPublished
    ? buildPostPublicUrl(cmsConfig, post, { allowRelative: true })
    : '';
  const { toast } = useToast();
  const tooltip = getPublicPostLinkTooltip(isPublished, publicUrl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isPublished && publicUrl) {
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (isPublished) {
      toast({
        title: 'Public URL is not ready',
        description:
          'Set the CMS public URL and make sure the selected post URL field has a value.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Post is not published',
      description: 'Publish this post before opening it on the website.',
      variant: 'warning',
    });
  };

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="inline-flex items-center">
            <Button
              type="button"
              variant={iconOnly ? 'ghost' : 'outline'}
              size={iconOnly ? 'icon' : 'sm'}
              className={iconOnly ? 'h-7 w-7' : 'h-8 gap-2'}
              aria-label={tooltip}
              onClick={handleOpen}
            >
              <IconExternalLink className="size-4" />
              {!iconOnly && <span>Open on site</span>}
            </Button>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content>{tooltip}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
