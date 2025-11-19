import {
  Badge,
  Button,
  InfoCard,
  Skeleton,
  Spinner,
  Table,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useGetTicketConfigs } from '../hooks/useGetTicketConfigs';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { configCreateModalAtom } from '../states';
import { useRemoveTicketConfig } from '../hooks/useRemoveTicketConfig';
import { useParams } from 'react-router-dom';

function formatDate(dateValue: Date | string | null | undefined): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? '-' : format(date, 'MM/dd/yyyy');
}

export const ConfigList = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const [open, setOpen] = useAtom(configCreateModalAtom);
  const [configId, setConfigId] = useQueryState<string | undefined>('configId');
  const { ticketConfigs, loading } = useGetTicketConfigs({
    variables: {
      pipelineId,
    },
  });
  const { removeTicketConfig, loading: removeLoading } =
    useRemoveTicketConfig();
  const { confirm } = useConfirm();
  const confirmationValue = 'delete';
  const onRemove = (id: string) => {
    confirm({
      message: `Are you sure you want to remove this configuration?`,
      options: { confirmationValue },
    }).then(() => {
      removeTicketConfig({ variables: { id } });
    });
  };
  if (loading)
    return (
      <div className="box-border flex-1 px-4 sm:px-8 lg:px-16">
        <Skeleton className="w-full h-8 mb-2" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  return (
    <div className="box-border flex-1 px-4 sm:px-8 lg:px-16">
      <InfoCard
        title="Pipeline Configuration"
        description="Configure the pipeline configuration"
      >
        <InfoCard.Content>
          <Table className="border-none [&_th]:border-none [&_td]:border-none">
            <Table.Header>
              <Table.Row className="[&>td]:font-mono [&>td]:uppercase [&>td]:font-semibold [&>td]:text-xs [&>td]:text-accent-foreground">
                <Table.Cell colSpan={3}>Name</Table.Cell>
                <Table.Cell colSpan={3} className="text-center">
                  Contact Type
                </Table.Cell>
                <Table.Cell colSpan={4} className="text-right">
                  Created At
                </Table.Cell>
                <Table.Cell colSpan={2} className="text-right">
                  Action
                </Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ticketConfigs?.map((config) => {
                return (
                  <Table.Row key={config.id}>
                    <Table.Cell colSpan={3}>
                      <Badge variant="secondary">{config.name}</Badge>
                    </Table.Cell>
                    <Table.Cell colSpan={3} className="text-center">
                      {config.contactType}
                    </Table.Cell>
                    <Table.Cell colSpan={4} className="text-right">
                      {formatDate(config.createdAt)}
                    </Table.Cell>
                    <Table.Cell colSpan={2}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setConfigId(config.id)}
                        >
                          <IconEdit />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onRemove(config.id)}
                          disabled={removeLoading}
                        >
                          {removeLoading ? (
                            <Spinner size="sm" />
                          ) : (
                            <IconTrash className="text-destructive" />
                          )}
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
            {ticketConfigs?.length === 0 && (
              <Table.Footer className="mt-4">
                <Table.Row className="hover:bg-transparent">
                  <Table.Cell colSpan={12}>
                    <div className="w-full pt-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setOpen(true)}
                      >
                        <IconPlus />
                        Add Configuration
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              </Table.Footer>
            )}
          </Table>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
