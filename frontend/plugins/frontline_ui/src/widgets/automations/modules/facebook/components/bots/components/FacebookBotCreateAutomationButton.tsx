import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
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
import {
  FACEBOOK_COMMENT_TRIGGER_TYPE,
  FACEBOOK_MESSAGE_TRIGGER_TYPE,
} from '~/widgets/automations/modules/facebook/components/bots/constants';
import { FacebookBotAiReplyDialog } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotAiReplyDialog';
import {
  isAiReplyChannel,
  TAiReplyChannel,
} from '~/widgets/automations/modules/facebook/components/bots/utils/buildAiReplySeedLink';

/** Only a saved bot can be pointed at, so this is absent while creating one. */
export const FacebookBotCreateAutomationButton = ({
  bot,
}: {
  bot?: IFacebookBot;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.facebook' });
  const navigate = useNavigate();
  // Kept in the URL, so coming back from creating an agent reopens the dialog.
  const [aiReplyQuery, setAiReplyChannel] =
    useQueryState<TAiReplyChannel>('aiReply');
  const aiReplyChannel = isAiReplyChannel(aiReplyQuery) ? aiReplyQuery : null;

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
              openSeededBuilder(FACEBOOK_MESSAGE_TRIGGER_TYPE, {
                botId: bot._id,
              })
            }
          >
            <IconMessage />
            {t('from-a-message', { defaultValue: 'From a message' })}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() =>
              // The comment trigger's schema keys off `postType`, so a seeded
              // config has to name one for the form to open valid.
              openSeededBuilder(FACEBOOK_COMMENT_TRIGGER_TYPE, {
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
      <FacebookBotAiReplyDialog
        channel={aiReplyChannel}
        botId={bot._id}
        botName={bot.name ?? undefined}
        onClose={() => setAiReplyChannel(null)}
      />
    </>
  );
};
