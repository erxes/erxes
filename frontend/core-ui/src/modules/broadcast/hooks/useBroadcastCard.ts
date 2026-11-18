import { BROADCAST_METHODS } from '@/broadcast/constants';
import type { TBroadcastCardMessage } from '@/broadcast/components/list/BroadcastCard';
import { broadcastMethodDisplay } from '@/broadcast/utils/broadcastMethod';
import { campaignStatus } from '@/broadcast/utils/campaignStatus';
import { IconTag, IconUsers } from '@tabler/icons-react';
import { useMultiQueryState } from 'erxes-ui';
import { MouseEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Which segment or tag this campaign targets, named rather than counted. */
const audienceOf = (
  message: TBroadcastCardMessage,
  t: (key: string) => string,
) => {
  const segments = message.segments || [];
  const tags = message.customerTags || [];
  const [Icon, list] = segments.length
    ? ([IconUsers, segments] as const)
    : ([IconTag, tags] as const);

  if (!list.length) {
    return { Icon: IconUsers, label: t('card.no-audience') };
  }

  const [first, ...rest] = list;
  const name = first.name?.trim() || t('untitled');

  return { Icon, label: rest.length ? `${name} +${rest.length}` : name };
};

/**
 * The line that tells two campaigns apart. An email is known by what it
 * says; a flow has no copy of its own and its audience shows below anyway.
 */
const subjectOf = (message: TBroadcastCardMessage) => {
  if (message.method === BROADCAST_METHODS.EMAIL) {
    return message.email?.subject;
  }

  if (message.method === BROADCAST_METHODS.NOTIFICATION) {
    return message.notification?.title;
  }

  return undefined;
};

const percentOf = (reached: number, targeted: number) =>
  targeted > 0 ? Math.round((reached / targeted) * 100) : 0;

/**
 * One campaign card. Before it runs there is nothing reached to show and the
 * audience was only counted at launch, so the targeted figure stands in.
 */
export const useBroadcastCard = (message: TBroadcastCardMessage) => {
  const { t } = useTranslation('broadcasts');
  const [, setQueryParams] = useMultiQueryState<{ messageId: string }>([
    'messageId',
  ]);
  const { Icon: MethodIcon, labelKey: methodKey } = broadcastMethodDisplay(
    message.method,
  );
  const { labelKey: statusKey, style: statusStyle } = campaignStatus(message);
  const audience = audienceOf(message, t);
  const subject = subjectOf(message);
  const targeted = message.totalCustomersCount || 0;
  const reached = message.validCustomersCount || 0;

  const open = useCallback(
    () => setQueryParams({ messageId: message._id }),
    [setQueryParams, message._id],
  );

  // The actions menu sits on the card, which opens on click too
  const stopClick = useCallback(
    (event: MouseEvent) => event.stopPropagation(),
    [],
  );

  return {
    MethodIcon,
    methodLine: subject ? `${t(methodKey)} · ${subject}` : t(methodKey),
    statusKey,
    statusStyle,
    AudienceIcon: audience.Icon,
    audienceLabel: audience.label,
    hasRun: !!message.runCount,
    reachedLabel: reached.toLocaleString(),
    targeted,
    progressStyle: { width: `${percentOf(reached, targeted)}%` },
    targetCountLabel: (message.targetCount || 0).toLocaleString(),
    // A campaign still waiting is read for when it goes out
    dateShown: message.nextRunAt || message.createdAt,
    isUpcoming: !!message.nextRunAt,
    open,
    stopClick,
  };
};
