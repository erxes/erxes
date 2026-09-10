import { IconChartBar, IconCheck } from '@tabler/icons-react';
import { Button, TextOverflowTooltip, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  INBOX_TARGET_KEYS,
  InboxTarget,
} from '@/inbox/conversations/constants/inboxTarget';
import { useChannelPollConversationCount } from '@/poll/hooks/useChannelPollConversationCount';

export const ChannelPollNavItem = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline');
  const [{ channelId: selectedChannelId, withPoll }, setFilters] =
    useMultiQueryState<InboxTarget>(INBOX_TARGET_KEYS);

  const isActive = !!withPoll && selectedChannelId === channelId;

  const { count } = useChannelPollConversationCount({ channelId });

  const handleClick = () =>
    setFilters({
      withPoll: isActive ? null : 'true',
      integrationType: null,
      integrationId: null,
      channelId: isActive ? null : channelId,
    });

  if (!count && !isActive) {
    return null;
  }

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start pl-7 relative overflow-hidden text-left w-full"
      onClick={handleClick}
    >
      {isActive ? (
        <IconCheck className="size-4 shrink-0" />
      ) : (
        <IconChartBar className="size-4 shrink-0 text-accent-foreground" />
      )}
      <TextOverflowTooltip className="flex-1 min-w-0" value={t('polls')} />
      {count > 0 && (
        <span className="shrink-0 text-xs tabular-nums">{count}</span>
      )}
    </Button>
  );
};
