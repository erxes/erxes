import { IconSearch } from '@tabler/icons-react';
import { Card, Command, getPluginAssetsUrl, Input, Skeleton } from 'erxes-ui';
import { INTEGRATIONS } from '../constants/integrations';
import { Link, useParams } from 'react-router-dom';
import { IntegrationLogo } from './IntegrationLogo';
import { IntegrationType } from '@/types/Integration';
import { gql, useQuery } from '@apollo/client';

export const IntegrationList = () => {
  return (
    <Command>
      {/* <div className="relative m-1 mb-8">
        <Command.Primitive.Input placeholder="Search integrations" asChild>
          <Input className="pl-8" placeholder="Search integrations" />
        </Command.Primitive.Input>
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <IconSearch className="size-4 text-accent-foreground" />
        </div>
      </div> */}
      <Command.List className="p-0">
        <Command.Group
          heading="Integrations"
          className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:mb-1.5 pb-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INTEGRATIONS).map(
              ([integrationType, integration]) => (
                <IntegrationCard
                  key={integrationType}
                  integration={integration}
                  integrationType={integrationType as IntegrationType}
                />
              ),
            )}
          </div>
        </Command.Group>
      </Command.List>
    </Command>
  );
};

export const IntegrationCard = ({
  integration,
  integrationType,
}: {
  integration: (typeof INTEGRATIONS)[keyof typeof INTEGRATIONS];
  integrationType: IntegrationType;
}) => {
  const { id: channelId } = useParams();
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
        {integration.description}
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
