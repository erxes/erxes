import { IconBrandMessenger, IconExternalLink } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AutomationTemplateRequirementProps,
  splitAutomationNodeType,
  TemplateRequirementOptions,
} from 'ui-modules';
import { FacebookBotSelector } from '~/widgets/automations/modules/facebook/components/MessengerBotSelector';
import { useFacebookTemplateRequirement } from '~/widgets/automations/modules/facebook/components/template/useFacebookTemplateRequirement';

// Connecting a page signs in to Facebook, so it keeps its own page
const CONNECT_BOT_PATH = '/settings/automations/bots/facebook-messenger-bots';

/**
 * Answers a template's `frontline:facebook.bot`: the page bot its Messenger
 * trigger listens to. The answer is the bot id, the trigger's `botId`.
 */
export const FacebookTemplateRequirement = ({
  kind,
  value,
  onChange,
  onLabel,
}: AutomationTemplateRequirementProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.facebook' });
  const { botId, options, loading, showCards, select } =
    useFacebookTemplateRequirement(value, onChange, onLabel);
  // `frontline:facebook.<what>`
  const [, , what] = splitAutomationNodeType(kind);

  if (what !== 'bot') {
    return null;
  }

  if (loading) {
    return <Spinner />;
  }

  if (!options.length) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-4">
        <IconBrandMessenger className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t(
            'template-connect-page',
            'Connect a Facebook page first. It opens in a new tab; come back here and it shows up.',
          )}
        </p>
        <Button variant="secondary" asChild>
          <a href={CONNECT_BOT_PATH} target="_blank" rel="noreferrer">
            <IconExternalLink />
            {t('template-connect-page-action', 'Connect Facebook page')}
          </a>
        </Button>
      </div>
    );
  }

  if (showCards) {
    return (
      <TemplateRequirementOptions
        options={options.map((option) => ({
          ...option,
          icon: <IconBrandMessenger className="size-4" />,
        }))}
        value={botId}
        onSelect={select}
        createLabel={t('template-connect-another-page', 'Connect another page')}
        createHref={CONNECT_BOT_PATH}
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <FacebookBotSelector botId={botId || undefined} onSelect={select} />
    </div>
  );
};
