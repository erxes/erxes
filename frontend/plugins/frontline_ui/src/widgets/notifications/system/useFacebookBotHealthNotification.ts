import { FACEBOOK_BOT_HEALTH_NOTIFICATION_DETAIL } from '@/integrations/facebook/graphql/queries/facebookBots';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { useQuery } from '@apollo/client';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconRefresh,
  IconRobot,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import { TNotification } from 'ui-modules';

export type TFacebookBotHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'broken'
  | 'syncing'
  | 'unknown';

type TFacebookBotHealthMetadata = {
  botId?: string;
  pageId?: string;
  status?: string;
  reason?: string;
};

type TFacebookBotDetailQuery = {
  facebookMessengerBot?: Pick<IFacebookBot, '_id' | 'name' | 'page' | 'pageId'>;
};

const statusVariantMap = {
  healthy: 'success',
  degraded: 'destructive',
  broken: 'destructive',
  syncing: 'secondary',
  unknown: 'secondary',
} as const;

const parseFacebookBotHealthMetadata = (
  metadata?: unknown,
): TFacebookBotHealthMetadata => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const candidate = metadata as Record<string, unknown>;

  return {
    botId: typeof candidate.botId === 'string' ? candidate.botId : undefined,
    pageId: typeof candidate.pageId === 'string' ? candidate.pageId : undefined,
    status: typeof candidate.status === 'string' ? candidate.status : undefined,
    reason: typeof candidate.reason === 'string' ? candidate.reason : undefined,
  };
};

const getStatus = (rawStatus?: string): TFacebookBotHealthStatus => {
  if (
    rawStatus === 'healthy' ||
    rawStatus === 'degraded' ||
    rawStatus === 'broken' ||
    rawStatus === 'syncing'
  ) {
    return rawStatus;
  }

  return 'unknown';
};

const getPageName = (
  bot?: Pick<IFacebookBot, '_id' | 'name' | 'page' | 'pageId'>,
) => {
  if (bot?.page && typeof bot.page === 'object' && 'name' in bot.page) {
    const pageName = (bot.page as { name?: unknown }).name;

    if (typeof pageName === 'string' && pageName.trim()) {
      return pageName;
    }
  }

  return bot?.name || '';
};

export const useFacebookBotHealthNotification = ({
  metadata,
  t,
}: Pick<TNotification, 'metadata'> & {
  t: TFunction;
}) => {
  const {
    botId,
    pageId,
    status: rawStatus,
    reason,
  } = parseFacebookBotHealthMetadata(metadata);

  const status = getStatus(rawStatus);

  const { data, loading } = useQuery<TFacebookBotDetailQuery>(
    FACEBOOK_BOT_HEALTH_NOTIFICATION_DETAIL,
    {
      variables: { _id: botId },
      skip: !botId,
    },
  );

  const bot = data?.facebookMessengerBot;
  const pageName = getPageName(bot);
  const botName = bot?.name || '';

  const statusView = buildStatusView(status, t);
  const pageValue = loading
    ? t('loading', { defaultValue: 'Loading...' })
    : pageName || t('notAvailable', { defaultValue: 'Not available' });
  const botValue = loading
    ? t('loading', { defaultValue: 'Loading...' })
    : botName || t('notAvailable', { defaultValue: 'Not available' });

  return {
    botId,
    pageId,
    status,
    reason,
    isBotDetailsLoading: loading,
    botName,
    pageName,
    statusView,
    pageValue,
    botValue,
  };
};

const buildStatusView = (
  status: TFacebookBotHealthStatus,
  t: TFunction,
) => {
  const statusMap = {
    healthy: {
      badgeLabel: t('healthy', { defaultValue: 'Healthy' }),
      description: t('facebookBotHealthyDescription', {
        defaultValue:
          'This bot is connected, subscribed, and ready to handle Facebook Messenger automations.',
      }),
      icon: IconCircleCheck,
      iconClassName: 'size-8 text-success',
      iconContainerClassName: 'bg-success/10 text-success',
    },
    degraded: {
      badgeLabel: t('needsRepair', { defaultValue: 'Needs repair' }),
      description: t('facebookBotDegradedDescription', {
        defaultValue:
          'This bot needs attention before Messenger automations can run reliably again.',
      }),
      icon: IconAlertTriangle,
      iconClassName: 'size-8 text-destructive',
      iconContainerClassName: 'bg-destructive/10 text-destructive',
    },
    broken: {
      badgeLabel: t('broken', { defaultValue: 'Broken' }),
      description: t('facebookBotBrokenDescription', {
        defaultValue:
          'The connection is currently unavailable, so Messenger automations may stop working.',
      }),
      icon: IconAlertTriangle,
      iconClassName: 'size-8 text-destructive',
      iconContainerClassName: 'bg-destructive/10 text-destructive',
    },
    syncing: {
      badgeLabel: t('syncing', { defaultValue: 'Syncing' }),
      description: t('facebookBotSyncingDescription', {
        defaultValue:
          'The bot is being verified and synced with Facebook right now.',
      }),
      icon: IconRefresh,
      iconClassName: 'size-8 text-muted-foreground',
      iconContainerClassName: 'bg-accent text-muted-foreground',
    },
    unknown: {
      badgeLabel: t('unknown', { defaultValue: 'Unknown' }),
      description: t('facebookBotUnknownDescription', {
        defaultValue:
          'We could not determine the latest bot health details from this notification.',
      }),
      icon: IconRobot,
      iconClassName: 'size-8 text-muted-foreground',
      iconContainerClassName: 'bg-accent text-muted-foreground',
    },
  } as const;

  return statusMap[status];
};
