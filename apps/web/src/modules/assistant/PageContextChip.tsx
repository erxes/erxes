import type { AssistantPage } from '@erxes/core-contract';
import { IconLayoutDashboard, IconX } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { badgeVariants, Button, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { IconTip } from '~/components/IconTip';
import { orpc } from '~/lib/api';
import { appOfPath, SETTINGS_APP, useNavApps } from '~/modules/navigation/apps';
import { RecordIcon } from './RecordChip';
import { pageOfPath } from './recordPages';

export const usePageContext = () => {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState<string | null>(null);
  const page = pageOfPath(pathname);

  return {
    page: page && page.path !== hidden ? page : null,
    hide: () => setHidden(pathname),
  };
};

const usePageLabel = (page: AssistantPage) => {
  const { t } = useTranslation('assistant');
  const apps = useNavApps();
  const record = useQuery(orpc.assistant.record.queryOptions({ input: page.record ?? skipToken }));

  if (record.data?.available) return record.data.label;

  if (page.path === '/') return t('page.home', 'Home');

  return appOfPath([...apps, SETTINGS_APP], page.path)?.label ?? page.path;
};

export const PageContextChip = ({
  page,
  onRemove,
}: {
  page: AssistantPage;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('assistant');
  const label = usePageLabel(page);
  const remove = t('page.remove', "Don't send this page");

  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <span className={cn(badgeVariants({ variant: 'secondary' }), 'min-w-0')} title={page.path}>
        {page.record ? (
          <RecordIcon type={page.record.type} />
        ) : (
          <IconLayoutDashboard aria-hidden className="size-3.5 shrink-0" />
        )}
        <span className="text-muted-foreground">{t('page.viewing', 'Viewing')}</span>
        <span className="truncate">{label}</span>
      </span>
      <IconTip label={remove}>
        <Button variant="ghost" size="icon" tone="muted" aria-label={remove} onClick={onRemove}>
          <IconX className="size-3.5" />
        </Button>
      </IconTip>
    </div>
  );
};
