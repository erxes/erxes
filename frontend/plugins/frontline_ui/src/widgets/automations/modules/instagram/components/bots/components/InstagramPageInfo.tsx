import { IconCircleCheck, IconInfoTriangle } from '@tabler/icons-react';
import { Label, Skeleton } from 'erxes-ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInstagramBotPages } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotPages';

type InstagramPageInfoProps = {
  accountId: string;
  pageId: string;
};

export const InstagramPageInfo = memo(
  ({ accountId, pageId }: InstagramPageInfoProps) => {
    const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
    const { page, loading } = useInstagramBotPages(accountId, pageId);

    if (!accountId || !pageId) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" />{' '}
          {t('select-a-page')}
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
          <IconInfoTriangle className="size-3 text-destructive" />{' '}
          {t('not-found')}
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
  (prevProps: InstagramPageInfoProps, nextProps: InstagramPageInfoProps) =>
    prevProps?.accountId === nextProps?.accountId &&
    prevProps?.pageId === nextProps?.pageId,
);
