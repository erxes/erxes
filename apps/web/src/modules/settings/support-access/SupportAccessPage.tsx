import type { SupportVisit } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconLifebuoy } from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Badge,
  Button,
  Empty,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  Switch,
  useFormat,
  useToast,
} from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { paths } from '~/lib/paths';
import { useMinuteClock } from '~/lib/useMinuteClock';

/** Refreshes the setting, the visits and the banner after a change. */
const useSupportChanged = () => {
  const client = useQueryClient();

  return () => client.invalidateQueries({ queryKey: orpc.supportAccess.key() });
};

const useErrorToast = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'support' });
  const { toast } = useToast();

  return (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', "Couldn't save"),
      description: messageOf(error),
    });
};

/** The owners' switch: erxes support may come in, or not. */
const AccessSwitch = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'support' });
  const id = useId();
  const changed = useSupportChanged();
  const settings = useQuery(orpc.supportAccess.settings.queryOptions());

  const save = useMutation(
    orpc.supportAccess.updateSettings.mutationOptions({
      onSuccess: changed,
      onError: useErrorToast(),
    }),
  );

  return (
    <QueryState query={settings}>
      {({ enabled, available }) => (
        <section className="space-y-2 rounded-lg border p-4">
          <label htmlFor={id} className="flex cursor-pointer items-start gap-4">
            <span className="min-w-0 flex-1 space-y-1">
              <span className="block text-sm font-medium">
                {t('switch', 'Let erxes support in')}
              </span>
              <span className="block text-sm text-muted-foreground">
                {t(
                  'switch-description',
                  'erxes staff open your workspace from erxes.io when you ask them for help, to set it up or fix it. They act as an owner for 4 hours and can change anything except this setting. You get an email each time.',
                )}
              </span>
            </span>
            <Switch
              id={id}
              checked={enabled}
              disabled={save.isPending}
              onCheckedChange={(next) => save.mutate({ enabled: next })}
            />
          </label>
          {!enabled && (
            <p className="text-sm text-warning-text">
              {t('off', 'Off: erxes support can’t enter, even when you ask them for help.')}
            </p>
          )}
          {!available && (
            <p className="text-sm text-muted-foreground">
              {t('unavailable', 'This server doesn’t take erxes support visits.')}
            </p>
          )}
        </section>
      )}
    </QueryState>
  );
};

const VisitRow = ({ visit }: { visit: SupportVisit }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'support' });
  const fmt = useFormat();
  const now = useMinuteClock();
  const changed = useSupportChanged();

  const end = useMutation(
    orpc.supportAccess.endVisit.mutationOptions({ onSuccess: changed, onError: useErrorToast() }),
  );

  const inProgress = visit.endedAt === null && new Date(visit.endsAt).getTime() > now;

  return (
    <li className="flex flex-wrap items-start gap-3 p-3 text-sm">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{visit.staffName}</span>
          <span className="text-muted-foreground">{visit.staffEmail}</span>
          {inProgress ? (
            <Badge variant="warning">{t('in-progress', 'In progress')}</Badge>
          ) : (
            <Badge variant="secondary">{t('ended', 'Ended')}</Badge>
          )}
        </div>
        <p className="break-words">{visit.reason}</p>
        <p className="text-xs text-muted-foreground">
          {inProgress
            ? t('started-until', '{{start}}, until {{end}}', {
                start: fmt.dateTime(visit.startedAt),
                end: fmt.time(visit.endsAt),
              })
            : t('started-ended', '{{start}} to {{end}}', {
                start: fmt.dateTime(visit.startedAt),
                end: fmt.time(visit.endedAt ?? visit.endsAt),
              })}
        </p>
      </div>
      {inProgress && (
        <Button
          variant="outline"
          size="sm"
          disabled={end.isPending}
          onClick={() => end.mutate({ id: visit.id })}
        >
          {t('end', 'End visit')}
        </Button>
      )}
    </li>
  );
};

const NoVisits = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'support' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconLifebuoy />
        </Empty.Media>
        <Empty.Title>{t('no-visits', 'erxes support hasn’t visited yet')}</Empty.Title>
        <Empty.Description>
          {t('no-visits-description', 'Each visit shows here, with who came in and why.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** Every visit, newest first. */
const Visits = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'support' });

  const list = useInfiniteQuery(
    orpc.supportAccess.visits.infiniteOptions({
      ...forwardPaging(30),
      input: (page) => page,
      select: ({ pages }) => pages.flatMap((page) => page.data),
    }),
  );

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">{t('visits', 'Visits')}</h3>
      <QueryState query={list} isEmpty={(rows) => !rows.length} empty={<NoVisits />}>
        {(rows) => (
          <div className="overflow-hidden rounded-lg border">
            <ul className="divide-y">
              {rows.map((visit) => (
                <VisitRow key={visit.id} visit={visit} />
              ))}
            </ul>
            {list.hasNextPage && (
              <div className="flex justify-center border-t py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={list.isFetchingNextPage}
                  onClick={() => void list.fetchNextPage()}
                >
                  {list.isFetchingNextPage ? <Spinner size="sm" /> : t('more', 'Show older visits')}
                </Button>
              </div>
            )}
          </div>
        )}
      </QueryState>
    </section>
  );
};

/** Settings › Support access (SaaS, owners): whether erxes support may come in, and each visit. */
export const SupportAccessPage = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'support' });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Support access'),
                to: paths.settings.supportAccess,
                icon: IconLifebuoy,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          <AccessSwitch />
          <Visits />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
