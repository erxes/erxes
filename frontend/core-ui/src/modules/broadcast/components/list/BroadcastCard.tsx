import { IconDotsVertical, IconTag, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  RelativeDateDisplay,
  TextOverflowTooltip,
  useMultiQueryState,
} from 'erxes-ui';
import { ApprovalLockedBadge } from 'ui-modules';
import { BROADCAST_METHODS } from '../../constants';
import { broadcastMethodDisplay } from '../../utils/broadcastMethod';
import { IBroadcastMethodEnum } from '../../types';
import { TCampaignLockState } from '../../utils/campaignActions';
import { campaignStatus } from '../../utils/campaignStatus';
import { BroadcastActionsMenu } from './BroadcastActionsMenu';

export type TBroadcastCardMessage = {
  _id: string;
  title?: string;
  method?: IBroadcastMethodEnum;
  createdAt?: string;
  totalCustomersCount?: number;
  validCustomersCount?: number;
  fromEmail?: string;
  email?: { subject?: string };
  notification?: { title?: string };
  segments?: { _id: string; name?: string }[];
  customerTags?: { _id: string; name?: string }[];
  isDraft?: boolean;
  isLive?: boolean;
  status?: string;
  kind?: string;
  runCount?: number;
  targetCount?: number;
  nextRunAt?: string;
  approvalLockState?: TCampaignLockState;
  scheduleDate?: {
    dateTime?: string | null;
    every?: string | null;
    endDate?: string | null;
  } | null;
};

/** Which segment or tag this campaign targets, named rather than counted. */
const audience = (
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
  const name = first.name?.trim() || 'Untitled';

  return { Icon, label: rest.length ? `${name} +${rest.length}` : name };
};

/**
 * The line that tells two campaigns apart.
 *
 * An email is known by what it says; a flow has no copy of its own, so its
 * audience carries that weight instead — and appears below on every card
 * anyway, which is why a workflow card leaves this empty rather than repeating
 * it.
 */
const subject = (message: TBroadcastCardMessage) => {
  if (message.method === BROADCAST_METHODS.EMAIL) {
    return message.email?.subject;
  }

  if (message.method === BROADCAST_METHODS.NOTIFICATION) {
    return message.notification?.title;
  }

  return undefined;
};

export const BroadcastCard = ({
  message,
}: {
  message: TBroadcastCardMessage;
}) => {
  const [, setQueryParams] = useMultiQueryState<{ messageId: string }>([
    'messageId',
  ]);

  const { t } = useTranslation('broadcasts');
  const { Icon: MethodIcon, labelKey: methodKey } = broadcastMethodDisplay(
    message.method,
  );
  const { labelKey, style } = campaignStatus(message);
  const { Icon: AudienceIcon, label: audienceLabel } = audience(message, t);
  const line = subject(message);

  // Before it runs there is nothing reached to show, and the audience was
  // only counted at launch — so what it targets is the honest figure until
  // then. Showing "0 / 0" for a campaign aimed at twenty people was not.
  const hasRun = !!message.runCount;
  const dateShown = message.nextRunAt || message.createdAt;
  const targeted = message.totalCustomersCount || 0;
  const reached = message.validCustomersCount || 0;
  const percentage = targeted > 0 ? Math.round((reached / targeted) * 100) : 0;

  return (
    <Card
      // Keeps offscreen cards out of layout and paint without a virtualizer.
      className="flex cursor-pointer flex-col gap-3 border p-4 transition-shadow hover:shadow-md [contain-intrinsic-size:auto_10rem] [content-visibility:auto]"
      onClick={() => setQueryParams({ messageId: message._id })}
    >
      <div className="flex min-w-0 items-start gap-3">
        {/* The same tile `Empty.Media` draws, without borrowing its slot: this
            card is not an empty state and should not answer to one. */}
        <div className="flex size-7 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
          <MethodIcon className="size-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="truncate font-medium leading-tight">
            <TextOverflowTooltip value={message.title} />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {line ? `${t(methodKey)} · ${line}` : t(methodKey)}
          </p>
        </div>

        <Badge variant={style}>{t(labelKey)}</Badge>
        <ApprovalLockedBadge state={message.approvalLockState ?? undefined} />
        <div onClick={(event) => event.stopPropagation()}>
          <BroadcastActionsMenu
            campaign={message}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('card.actions')}
                className="size-6 text-muted-foreground"
              >
                <IconDotsVertical className="size-4" />
              </Button>
            }
          />
        </div>
      </div>

      <div className="mt-auto space-y-1.5">
        {hasRun ? (
          <>
            <p className="text-sm tabular-nums">
              <span className="font-semibold">{reached.toLocaleString()}</span>
              <span className="text-muted-foreground">
                {' / '}
                {t('card.reached', { count: targeted })}
              </span>
            </p>
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-muted"
              role="presentation"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">
              {(message.targetCount || 0).toLocaleString()}
            </span>{' '}
            {t('card.targeted')}
          </p>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <AudienceIcon className="size-3.5 flex-none" />
        <span className="min-w-0 flex-1 truncate">{audienceLabel}</span>
        {/* A campaign still waiting is read for when it goes out, not for
            when it was made. */}
        {!!dateShown && (
          <RelativeDateDisplay value={dateShown} asChild>
            <span className="flex-none">
              {!!message.nextRunAt && `${t('card.goes-out')} `}
              <RelativeDateDisplay.Value value={dateShown} />
            </span>
          </RelativeDateDisplay>
        )}
      </div>
    </Card>
  );
};
