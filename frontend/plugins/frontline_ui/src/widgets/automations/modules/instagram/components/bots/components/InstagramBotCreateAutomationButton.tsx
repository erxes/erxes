import { IInstagramBotDetail } from '@/integrations/instagram/types/InstagramBot';
import {
  IconBolt,
  IconMessage,
  IconMessageCircle,
  IconSparkles,
} from '@tabler/icons-react';
import { Button, DropdownMenu, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { buildAutomationSeedLink } from 'ui-modules';
import { InstagramBotAiReplyDialog } from '~/widgets/automations/modules/instagram/components/bots/components/InstagramBotAiReplyDialog';
import {
  INSTAGRAM_COMMENT_TRIGGER_TYPE,
  INSTAGRAM_MESSAGE_TRIGGER_TYPE,
} from '~/widgets/automations/modules/instagram/components/bots/constants';
import {
  isInstagramAiReplyChannel,
  TInstagramAiReplyChannel,
} from '~/widgets/automations/modules/instagram/components/bots/utils/buildAiReplySeedLink';

export const InstagramBotCreateAutomationButton = ({
  bot,
}: {
  bot?: IInstagramBotDetail;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
  const navigate = useNavigate();
  const [aiReplyQuery, setAiReplyChannel] =
    useQueryState<TInstagramAiReplyChannel>('aiReply');
  const aiReplyChannel = isInstagramAiReplyChannel(aiReplyQuery)
    ? aiReplyQuery
    : null;

  if (!bot?._id) {
    return null;
  }

  const openSeededBuilder = (
    triggerType: string,
    triggerConfig: Record<string, unknown>,
  ) =>
    navigate(
      buildAutomationSeedLink({
        triggerType,
        triggerConfig,
        name: bot.name ?? undefined,
      }),
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">
            <IconBolt />
            {t('create-automation', { defaultValue: 'Create automation' })}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item
            onSelect={() =>
              openSeededBuilder(INSTAGRAM_MESSAGE_TRIGGER_TYPE, {
                botId: bot._id,
              })
            }
          >
            <IconMessage />
            {t('from-a-message', { defaultValue: 'From a message' })}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() =>
              openSeededBuilder(INSTAGRAM_COMMENT_TRIGGER_TYPE, {
                botId: bot._id,
                postType: 'any',
                onlyFirstLevel: true,
              })
            }
          >
            <IconMessageCircle />
            {t('from-a-comment', { defaultValue: 'From a comment' })}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => setAiReplyChannel('messenger')}>
            <IconSparkles />
            {t('ai-messenger-reply', { defaultValue: 'AI messenger reply' })}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setAiReplyChannel('comment')}>
            <IconSparkles />
            {t('ai-comment-reply', { defaultValue: 'AI comment reply' })}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <InstagramBotAiReplyDialog
        channel={aiReplyChannel}
        botId={bot._id}
        botName={bot.name ?? undefined}
        onClose={() => setAiReplyChannel(null)}
      />
    </>
  );
};
