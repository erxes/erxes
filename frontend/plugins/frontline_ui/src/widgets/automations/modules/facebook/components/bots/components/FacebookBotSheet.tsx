import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { IconBolt } from '@tabler/icons-react';
import { Button, Sheet, useQueryState } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buildAutomationSeedLink } from 'ui-modules';
import { FACEBOOK_MESSAGE_TRIGGER_TYPE } from '~/widgets/automations/modules/facebook/components/bots/constants';
import { FacebookBotFormBody } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotFormBody';
import { TFacebookBotPage } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookIntegrationBot';

/** A page always has a bot surface, whether or not the bot exists yet. */
export const getFacebookBotSheetKey = (
  page: TFacebookBotPage,
  bot?: IFacebookBot,
) => bot?._id || page.pageId;

/** Opens the sheet the table row owns, from anywhere on the same page. */
export const useOpenFacebookBotSheet = () => {
  const [, setOpenBotId] = useQueryState<string>('botId');

  return (key: string) => setOpenBotId(key);
};

/**
 * The bot configuration surface for a page that is already known. Mounted once
 * per integration row; other surfaces open it through the query parameter.
 */
export const FacebookBotSheet = ({
  page,
  bot,
  children,
}: {
  page: TFacebookBotPage;
  bot?: IFacebookBot;
  // The trigger, rendered through `Sheet.Trigger asChild`.
  children: ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const [openBotId, setOpenBotId] = useQueryState<string>('botId');
  // A bot that does not exist yet is addressed by its page instead, so both
  // cases survive a reload or the browser's back button.
  const sheetKey = getFacebookBotSheetKey(page, bot);
  // A numeric page id comes back from the query parser as a number.
  const isOpen = String(openBotId ?? '') === sheetKey;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => setOpenBotId(open ? sheetKey : null)}
    >
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-none w-[calc(100vw-1rem)] md:w-[92vw]">
        <Sheet.Header className="justify-between">
          <Sheet.Title className="capitalize">
            {bot ? t('edit') : t('add-new')} {t('facebook-bot')}
          </Sheet.Title>
          <div className="flex items-center gap-2">
            {bot && (
              <Button variant="secondary" asChild>
                <Link
                  to={buildAutomationSeedLink({
                    triggerType: FACEBOOK_MESSAGE_TRIGGER_TYPE,
                    triggerConfig: { botId: bot._id },
                    name: bot.name,
                  })}
                >
                  <IconBolt />
                  {t('create-automation', {
                    defaultValue: 'Create automation',
                  })}
                </Link>
              </Button>
            )}
            <Sheet.Close />
          </div>
        </Sheet.Header>
        {isOpen && (
          <FacebookBotFormBody facebookBotId={bot?._id ?? null} page={page} />
        )}
      </Sheet.View>
    </Sheet>
  );
};
