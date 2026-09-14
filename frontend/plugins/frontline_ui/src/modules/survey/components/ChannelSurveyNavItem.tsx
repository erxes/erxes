import { IconChartBar, IconCheck } from '@tabler/icons-react';
import { Button, TextOverflowTooltip, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  INBOX_TARGET_KEYS,
  InboxTarget,
} from '@/inbox/conversations/constants/inboxTarget';
import { useChannelSurveyConversationCount } from '@/survey/hooks/useChannelSurveyConversationCount';

export const ChannelSurveyNavItem = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline');
  const [{ channelId: selectedChannelId, withSurvey }, setFilters] =
    useMultiQueryState<InboxTarget>(INBOX_TARGET_KEYS);

  const isActive = !!withSurvey && selectedChannelId === channelId;

  const { count } = useChannelSurveyConversationCount({ channelId });

  const handleClick = () =>
    setFilters({
      withSurvey: isActive ? null : 'true',
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
      className="relative w-full justify-start overflow-hidden pl-10 text-left"
      onClick={handleClick}
    >
      {isActive ? (
        <IconCheck className="size-4 shrink-0" />
      ) : (
        <IconChartBar className="size-4 shrink-0 text-accent-foreground" />
      )}
      <TextOverflowTooltip
        className="flex-1 min-w-0"
        value={t('surveys', 'Surveys')}
      />
      {count > 0 && (
        <span className="shrink-0 text-xs tabular-nums">{count}</span>
      )}
    </Button>
  );
};
