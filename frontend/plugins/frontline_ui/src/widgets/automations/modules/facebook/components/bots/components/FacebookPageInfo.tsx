import { IconCircleCheck, IconInfoTriangle } from '@tabler/icons-react';
import { Label, Skeleton } from 'erxes-ui';
import { memo } from 'react';
import { useFacebookBotPages } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotPages';

type FacebookPageInfoProps = {
  accountId: string;
  pageId: string;
};

export const FacebookPageInfo = memo(
  ({ accountId, pageId }: FacebookPageInfoProps) => {
    const { page, loading } = useFacebookBotPages(accountId, pageId);

    if (!accountId || !pageId) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" /> Select a Page
        </Label>
      );
    }

    if (loading) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-5 w-36" />
        </Label>
      );
    }

    if (!page) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" /> Not found
        </Label>
      );
    }

    return (
      <Label className="text-lg flex gap-2 items-center">
        <IconCircleCheck className="size-3 text-success" />
        {page.name}
      </Label>
    );
  },
  (prevProps: FacebookPageInfoProps, nextProps: FacebookPageInfoProps) =>
    prevProps?.accountId === nextProps?.accountId &&
    prevProps?.pageId === nextProps?.pageId,
);
