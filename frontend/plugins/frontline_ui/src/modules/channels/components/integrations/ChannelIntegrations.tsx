import { useIntegrations } from '@/integrations/hooks/useIntegrations';
import { IconSettings } from '@tabler/icons-react';
import { Button, ScrollArea, Skeleton, Table } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function ChannelIntegrations() {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams();
  const { integrations, loading } = useIntegrations({
    variables: {
      channelId: channelId,
    },
    skip: !channelId,
  });
  return (
    <div className="overflow-hidden h-full px-8">
      <div className="ml-auto flex justify-between py-6">
        <h1 className="text-xl font-semibold">{t('integrations')}</h1>
      </div>
      <div className="bg-sidebar border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head className="pl-2 w-auto">{t('name')}</Table.Head>
              <Table.Head className="w-52">{t('status')}</Table.Head>
              <Table.Head className="w-52">{t('health-status')}</Table.Head>
              <Table.Head className="w-52">{t('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>
        <ScrollArea className="h-[calc(100vh-250px)]">
          <Table>
            <Table.Body>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <IntegrationRowSkeleton key={index} />
                  ))
                : integrations?.map((integration) => (
                    <Table.Row
                      key={integration._id}
                      className="hover:cursor-pointer shadow-xs"
                    >
                      <Table.Cell className="font-medium border-none pl-2 w-auto flex-1">
                        {integration.name}
                      </Table.Cell>
                      <Table.Cell className="w-52 border-none"></Table.Cell>
                      <Table.Cell className="w-52 border-none"></Table.Cell>
                      <Table.Cell className="w-52 border-none">
                        <Button variant="outline">
                          <IconSettings />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
            </Table.Body>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

const IntegrationRowSkeleton = () => {
  return (
    <Table.Row className="shadow-xs">
      <Table.Cell className="font-medium border-none pl-2 w-auto">
        <Skeleton className="h-4 w-full rounded-full" />
      </Table.Cell>
      <Table.Cell className="w-52 border-none">
        <Skeleton className="h-4 w-full rounded-full" />
      </Table.Cell>
      <Table.Cell className="w-52 border-none">
        <Skeleton className="h-4 w-full rounded-full" />
      </Table.Cell>
      <Table.Cell className="w-52 border-none">
        <Skeleton className="h-6 w-24 rounded-full" />
      </Table.Cell>
    </Table.Row>
  );
};
