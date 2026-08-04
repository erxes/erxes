import { IconCircleCheck, IconInfoTriangle } from '@tabler/icons-react';
import { Label } from 'erxes-ui';
import { memo } from 'react';
import { useInstagramBotPages } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotPages';

export const InstagramPageInfo = memo(
  ({ accountId, pageId }: { accountId: string; pageId: string }) => {
    if (!accountId || !pageId) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" /> Select a Page
        </Label>
      );
    }

    const { page } = useInstagramBotPages(accountId, pageId);

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
  (prevProps: any, nextProps: any) =>
    prevProps?.accountId === nextProps?.accountId &&
    prevProps?.pageId === nextProps?.pageId,
);
