import { IconDotsVertical } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ApprovalLockedBadge } from 'ui-modules';
import { useBroadcastCard } from '../../hooks/useBroadcastCard';
import { IBroadcastMethodEnum } from '../../types';
import { TCampaignLockState } from '../../utils/campaignActions';
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

export const BroadcastCard = ({
  message,
}: {
  message: TBroadcastCardMessage;
}) => {
  const { t } = useTranslation('broadcasts');
  const {
    MethodIcon,
    methodLine,
    statusKey,
    statusStyle,
    AudienceIcon,
    audienceLabel,
    hasRun,
    reachedLabel,
    targeted,
    progressStyle,
    targetCountLabel,
    dateShown,
    isUpcoming,
    open,
    stopClick,
  } = useBroadcastCard(message);

  return (
    <Card
      // Keeps offscreen cards out of layout and paint without a virtualizer.
      className="flex cursor-pointer flex-col gap-3 border p-4 transition-shadow hover:shadow-md [contain-intrinsic-size:auto_10rem] [content-visibility:auto]"
      onClick={open}
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
          <p className="truncate text-xs text-muted-foreground">{methodLine}</p>
        </div>

        <Badge variant={statusStyle}>{t(statusKey)}</Badge>
        <ApprovalLockedBadge state={message.approvalLockState ?? undefined} />
        <div onClick={stopClick}>
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
              <span className="font-semibold">{reachedLabel}</span>
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
                style={progressStyle}
              />
            </div>
          </>
        ) : (
          <p className="text-sm tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">
              {targetCountLabel}
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
              {isUpcoming && `${t('card.goes-out')} `}
              <RelativeDateDisplay.Value value={dateShown} />
            </span>
          </RelativeDateDisplay>
        )}
      </div>
    </Card>
  );
};
