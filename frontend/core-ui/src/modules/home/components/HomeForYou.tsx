import {
  HomeEmpty,
  HomeItemMark,
  HomeItemTime,
  HomeList,
  HomeListItem,
  HomePage,
  HomeSection,
} from '@/home/components/HomeList';
import { useStarredPages } from '@/navigation/hooks/useStarredPages';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { useRecentPages } from '@/navigation/hooks/useRecentPages';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NOTIFICATIONS } from '@/notification/graphql/notificationsQueries';
import { AppPath } from '@/types/paths/AppPath';
import { HomePath } from '@/types/paths/HomePath';
import { useQuery } from '@apollo/client';
import { IconBell } from '@tabler/icons-react';
import { Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState, TNotification } from 'ui-modules';

const PREVIEW_SIZE = 6;

const greetingKey = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'good-morning';
  if (hour < 18) return 'good-afternoon';

  return 'good-evening';
};

type NotificationGroup = {
  key: string;
  app?: INavigationActivity;
  items: TNotification[];
};

/** Unread notifications grouped by the app named in their contentType. */
const useUnreadByApp = () => {
  const activities = useNavigationActivities();
  const { data, loading } = useQuery<{
    notifications: { list: TNotification[] };
  }>(NOTIFICATIONS, { variables: { status: 'UNREAD', limit: 50 } });

  const groups = Object.values(
    (data?.notifications.list ?? []).reduce<Record<string, NotificationGroup>>(
      (acc, notification) => {
        const key = (notification.contentType ?? 'core').split(':')[0];
        acc[key] ??= {
          key,
          app: activities.find((activity) => activity.id === key),
          items: [],
        };
        acc[key].items.push(notification);

        return acc;
      },
      {},
    ),
  ).sort((left, right) => right.items.length - left.items.length);

  return { groups, loading };
};

const groupLabel = ({ key, app }: NotificationGroup, workspaceLabel: string) =>
  app?.label ??
  (key === 'core'
    ? workspaceLabel
    : key.charAt(0).toUpperCase() + key.slice(1));

const WaitingOnYou = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { groups, loading } = useUnreadByApp();
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <HomeSection
      label={t('waiting-on-you')}
      count={total}
      action={{ label: t('open-inbox'), to: `/${AppPath.MyInbox}` }}
    >
      {loading && <Skeleton className="h-48 rounded-lg" />}
      {!loading && groups.length === 0 && (
        <HomeEmpty>{t('all-caught-up')}</HomeEmpty>
      )}
      {groups.length > 0 && (
        <HomeList>
          {groups.slice(0, PREVIEW_SIZE).map((group) => (
            <HomeListItem
              key={group.key}
              to={`/${AppPath.MyInbox}/${group.items[0]._id}`}
              leading={<HomeItemMark app={group.app} icon={IconBell} />}
              title={group.items[0].title}
              subtitle={`${groupLabel(group, t('workspace'))}${
                group.items.length > 1
                  ? ` · ${t('more-count', { count: group.items.length - 1 })}`
                  : ''
              }`}
              trailing={<HomeItemTime date={group.items[0].createdAt} />}
            />
          ))}
        </HomeList>
      )}
    </HomeSection>
  );
};

const JumpBackIn = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const recent = useRecentPages();

  return (
    <HomeSection
      label={t('jump-back-in')}
      action={
        recent.length > PREVIEW_SIZE
          ? { label: t('view-all'), to: `/${AppPath.Home}${HomePath.Recent}` }
          : undefined
      }
    >
      {recent.length === 0 ? (
        <HomeEmpty>{t('recent-empty')}</HomeEmpty>
      ) : (
        <HomeList>
          {recent.slice(0, PREVIEW_SIZE).map((page) => (
            <HomeListItem
              key={page.to}
              to={page.to}
              leading={<HomeItemMark app={page.activity} />}
              title={page.label}
              subtitle={page.activity.label}
              trailing={<HomeItemTime date={page.visitedAt} />}
            />
          ))}
        </HomeList>
      )}
    </HomeSection>
  );
};

const Starred = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const starred = useStarredPages();

  return (
    <HomeSection
      label={t('starred')}
      count={starred.length}
      action={
        starred.length > PREVIEW_SIZE
          ? { label: t('view-all'), to: `/${AppPath.Home}${HomePath.Starred}` }
          : undefined
      }
    >
      {starred.length === 0 ? (
        <HomeEmpty>{t('starred-empty')}</HomeEmpty>
      ) : (
        <HomeList>
          {starred.slice(0, PREVIEW_SIZE).map((page) => (
            <HomeListItem
              key={page.to}
              to={page.to}
              leading={<HomeItemMark app={page.app} icon={page.icon} />}
              title={page.title}
              subtitle={page.app?.label ?? page.section}
            />
          ))}
        </HomeList>
      )}
    </HomeSection>
  );
};

/** Workspace home: what you were doing, what you starred, what needs you. */
export const HomeForYou = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const currentUser = useAtomValue(currentUserState);
  const firstName =
    currentUser?.details?.firstName ||
    currentUser?.details?.fullName?.split(' ')[0];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <HomePage
      title={`${t(greetingKey())}${firstName ? `, ${firstName}` : ''}`}
      description={today}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <JumpBackIn />
          <Starred />
        </div>
        <WaitingOnYou />
      </div>
    </HomePage>
  );
};
