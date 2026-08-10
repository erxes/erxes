import { Card, Command, getPluginAssetsUrl, Skeleton } from 'erxes-ui';
import { INTEGRATIONS } from '../constants/integrations';
import { Link, useParams } from 'react-router-dom';
import { IntegrationLogo } from './IntegrationLogo';
import { IntegrationType } from '@/types/Integration';
import { gql, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

export const IntegrationList = ({
  channelId,
  heading,
}: {
  // Defaults to the `:id` route param; pass it explicitly on routes that do not
  // carry a channel id, such as the personal channel page.
  channelId?: string;
  heading?: string;
} = {}) => {
  const { t } = useTranslation('frontline');

  // Every channel offers the same integrations, personal or team.
  const entries = Object.entries(INTEGRATIONS);

  return (
    <Command>
      <Command.Group
        heading={heading ?? t('integrations')}
        className="**:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:mb-1.5 pb-8"
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(([integrationType, integration]) => (
            <IntegrationCard
              key={integrationType}
              integration={integration}
              integrationType={integrationType as IntegrationType}
              channelId={channelId}
            />
          ))}
        </div>
      </Command.Group>
    </Command>
  );
};

export const IntegrationCard = ({
  integration,
  integrationType,
  channelId: channelIdProp,
}: {
  integration: (typeof INTEGRATIONS)[keyof typeof INTEGRATIONS];
  integrationType: IntegrationType;
  channelId?: string;
}) => {
  const { id } = useParams();
  const channelId = channelIdProp ?? id;
  return (
    <Command.Primitive.Item asChild key={integrationType}>
      <Link
        to={`/settings/frontline/channels/details/${channelId}/${integrationType}`}
      >
        <Card className="h-full p-3 flex flex-col gap-2 rounded-lg">
          <IntegrationIntro
            integration={integration}
            integrationType={integrationType}
            channelId={channelId}
          />
        </Card>
      </Link>
    </Command.Primitive.Item>
  );
};

export const IntegrationIntro = ({
  integration,
  integrationType,
  channelId,
}: {
  integration?: (typeof INTEGRATIONS)[keyof typeof INTEGRATIONS];
  integrationType: IntegrationType;
  channelId?: string;
}) => {
  const { t } = useTranslation('frontline');
  if (!integration) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <IntegrationLogo
          img={getPluginAssetsUrl('frontline', integration.img)}
          name={integration.name}
        />
        <h6 className="font-semibold text-sm self-center">
          {integration.name}
        </h6>
        <div className="text-xs text-muted-foreground font-mono ml-auto">
          <IntegrationCount
            kind={integrationType}
            channelId={channelId || ''}
          />
        </div>
      </div>
      <div className="text-sm text-muted-foreground font-medium">
        {t(integration.descriptionKey)}
      </div>
    </>
  );
};

const IntegrationCount = ({
  kind,
  channelId,
}: {
  kind: string;
  channelId: string;
}) => {
  const { data, loading } = useQuery(
    gql`
      query IntegrationsTotalCount($kind: String, $channelId: String!) {
        integrationsTotalCount(kind: $kind, channelId: $channelId) {
          total
        }
      }
    `,
    {
      variables: {
        channelId: channelId || '',
        kind,
      },
    },
  );

  return (
    <div className="text-xs text-muted-foreground font-mono ml-auto flex">
      {loading ? (
        <Skeleton className="w-3 h-4" />
      ) : (
        `(${data?.integrationsTotalCount?.total})`
      )}
    </div>
  );
};
