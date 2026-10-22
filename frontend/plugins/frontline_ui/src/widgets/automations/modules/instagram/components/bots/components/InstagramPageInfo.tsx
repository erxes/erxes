import { IconCircleCheck, IconInfoTriangle } from '@tabler/icons-react';
import { Label } from 'erxes-ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInstagramBotPages } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotPages';

export const InstagramPageInfo = memo(
  ({ accountId, pageId }: { accountId: string; pageId: string }) => {
    const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
    if (!accountId || !pageId) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" /> {t('select-a-page')}
        </Label>
      );
    }

    const { page } = useInstagramBotPages(accountId, pageId);

    if (!page) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" /> {t('not-found')}
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
