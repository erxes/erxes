import { IconExternalLink, IconPhotoOff } from '@tabler/icons-react';
import { Skeleton, readImage } from 'erxes-ui';
import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import { useFacebookPost } from '@/integrations/facebook/hooks/useFacebookPost';
import { useIgPost } from '@/integrations/instagram/hooks/useIgPost';
import { IntegrationType } from '@/types/Integration';

export const PostMediaCard = ({
  conversationId,
  integrationKind,
  fallbackUrl,
}: {
  conversationId: string;
  integrationKind:
    | IntegrationType.FACEBOOK_POST
    | IntegrationType.INSTAGRAM_POST;
  fallbackUrl?: string;
}) => {
  const isFacebook = integrationKind === IntegrationType.FACEBOOK_POST;
  const { post: facebookPost, loading: facebookLoading } = useFacebookPost({
    erxesApiId: isFacebook ? conversationId : '',
  });
  const { post: instagramPost, loading: instagramLoading } = useIgPost({
    erxesApiId: isFacebook ? undefined : conversationId,
  });

  const post = isFacebook ? facebookPost : instagramPost;
  const permalink = post?.permalink_url;
  const thumbnail = post?.attachments?.[0]?.url || fallbackUrl;
  const label = permalink?.includes('/reel/') ? 'Reel' : 'Post';

  if (facebookLoading || instagramLoading) {
    return <Skeleton className="mt-1 h-20 w-52 rounded-xl" />;
  }

  const card = (
    <>
      {thumbnail ? (
        <InboxImage
          src={readImage(thumbnail)}
          alt={`${label} preview`}
          loading="lazy"
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
          <IconPhotoOff className="size-5 text-muted-foreground" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground">
          View on {isFacebook ? 'Facebook' : 'Instagram'}
        </span>
      </span>
      {permalink && (
        <IconExternalLink className="size-4 text-muted-foreground" />
      )}
    </>
  );

  if (!permalink) {
    return (
      <div className="mt-1 flex w-52 items-center gap-2 rounded-xl border bg-background p-2">
        {card}
      </div>
    );
  }

  return (
    <a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 flex w-52 items-center gap-2 rounded-xl border bg-background p-2 no-underline transition-colors hover:bg-muted/50"
    >
      {card}
    </a>
  );
};
