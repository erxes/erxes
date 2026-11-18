import { CallConfigUpdate } from '@/integrations/call/components/CallConfigUpdate';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { FacebookConfigUpdate } from '@/integrations/facebook/components/FacebookConfigUpdate';
import { InstagramConfigUpdate } from '@/integrations/instagram/components/InstagramConfigUpdate';
import { MailConfigUpdate } from '@/integrations/mail/components/MailConfigUpdate';
import { TelegramConfig } from '@/integrations/telegram/TelegramConfig';
import {
  INTEGRATIONS_CONFIG_PATH,
  TConfigProviderSegment,
  useConfigProviders,
} from '@/integrations-config/hooks/useConfigProviders';
import { getPluginAssetsUrl } from 'erxes-ui';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';

const PROVIDER_CONTENT: Record<TConfigProviderSegment, ComponentType> = {
  facebook: FacebookConfigUpdate,
  instagram: InstagramConfigUpdate,
  telegram: TelegramConfig,
  call: CallConfigUpdate,
  mail: MailConfigUpdate,
};

const useProviderCopy = (segment: TConfigProviderSegment) => {
  const { t } = useTranslation('frontline');
  const tk = (key: string, fallback: string) =>
    t(`modules.integrations.${key}`, fallback);

  const copy: Record<TConfigProviderSegment, { title: string; text: string }> =
    {
      facebook: {
        title: 'Facebook',
        text: tk(
          'config-facebook-description',
          'App ID, secret and verify token used to connect Facebook pages.',
        ),
      },
      instagram: {
        title: 'Instagram',
        text: tk(
          'config-instagram-description',
          'App credentials used to connect Instagram business accounts.',
        ),
      },
      telegram: {
        title: 'Telegram',
        text: tk(
          'config-telegram-description',
          'Bots are connected from each inbox. There is nothing to set here.',
        ),
      },
      call: {
        title: tk('call', 'Call'),
        text: tk(
          'config-call-description',
          'STUN and TURN servers used by in-browser calls.',
        ),
      },
      mail: {
        title: t('mail-cloudflare-config-title'),
        text: tk(
          'config-mail-description',
          'Receive and send inbox mail through your own Cloudflare account.',
        ),
      },
    };

  return copy[segment];
};

const IntegrationConfigPane = ({
  segment,
  img,
}: {
  segment: TConfigProviderSegment;
  img: string;
}) => {
  const { title, text } = useProviderCopy(segment);
  const Content = PROVIDER_CONTENT[segment];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-8 py-8">
        <header className="flex items-center gap-3">
          <IntegrationLogo
            img={getPluginAssetsUrl('frontline', img)}
            name={title}
            className="size-10 shrink-0 rounded-md"
          />
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        </header>
        <div className="rounded-lg border bg-background p-4">
          <Content />
        </div>
      </div>
    </div>
  );
};

export const IntegrationConfigPage = () => {
  const { provider: segment } = useParams<{ provider: string }>();
  const providers = useConfigProviders();
  const provider = providers.find((item) => item.segment === segment);

  if (!provider) {
    return <Navigate to={`/${INTEGRATIONS_CONFIG_PATH}`} replace />;
  }

  return (
    <IntegrationConfigPane
      key={provider.segment}
      segment={provider.segment}
      img={provider.img}
    />
  );
};
