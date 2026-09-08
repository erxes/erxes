import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { IconBolt } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buildAutomationSeedLink } from 'ui-modules';
import { FACEBOOK_MESSAGE_TRIGGER_TYPE } from '~/widgets/automations/modules/facebook/components/bots/constants';

/** Only a saved bot can be pointed at, so this is absent while creating one. */
export const FacebookBotCreateAutomationButton = ({
  bot,
}: {
  bot?: IFacebookBot;
}) => {
  const { t } = useTranslation('frontline');

  if (!bot?._id) {
    return null;
  }

  return (
    <Button variant="secondary" asChild>
      <Link
        to={buildAutomationSeedLink({
          triggerType: FACEBOOK_MESSAGE_TRIGGER_TYPE,
          triggerConfig: { botId: bot._id },
          name: bot.name,
        })}
      >
        <IconBolt />
        {t('create-automation', { defaultValue: 'Create automation' })}
      </Link>
    </Button>
  );
};
