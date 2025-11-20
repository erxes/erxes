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
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { configCreateModalAtom } from '../states';
import { useRemoveTicketConfig } from '../hooks/useRemoveTicketConfig';
import { useGetTicketConfigByPipelineId } from '../hooks/useGetTicketConfigByPipelineId';

function formatDate(dateValue: Date | string | null | undefined): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? '-' : format(date, 'MM/dd/yyyy');
}

export const ConfigList = () => {
  const [, setOpen] = useAtom(configCreateModalAtom);
  const [, setConfigId] = useQueryState<string | undefined>('configId');
  const { ticketConfig, loading } = useGetTicketConfigByPipelineId();

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
        title="Messenger Configuration"
        description="Configure the messenger configuration"
      >
        <InfoCard.Content>
          <Table className="border-none [&_th]:border-none [&_td]:border-none rounded-xl overflow-hidden">
            <Table.Header>
              <Table.Row className="[&>td]:font-mono [&>td]:uppercase [&>td]:font-semibold [&>td]:text-xs [&>td]:text-accent-foreground">
                <Table.Cell colSpan={3} className="ps-2">
                  Name
                </Table.Cell>
                <Table.Cell colSpan={3} className="text-center">
                  Contact Type
                </Table.Cell>
                <Table.Cell colSpan={4} className="text-right">
                  Created At
                </Table.Cell>
                <Table.Cell colSpan={2} className="text-right pe-2">
                  Action
                </Table.Cell>
              </Table.Row>
            </Table.Header>
            {(ticketConfig && (
              <Table.Body>
                <Table.Row
                  key={ticketConfig?.id}
                  className="hover:bg-transparent"
                >
                  <Table.Cell
                    colSpan={3}
                    className="group-hover/table-row:bg-transparent ps-2"
                  >
                    <Badge
                      variant="secondary"
                      onClick={() => setConfigId(ticketConfig?.id)}
                      className="cursor-pointer"
                    >
                      {ticketConfig?.name}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell
                    colSpan={3}
                    className="text-center group-hover/table-row:bg-transparent"
                  >
                    {ticketConfig?.contactType}
                  </Table.Cell>
                  <Table.Cell
                    colSpan={4}
                    className="text-right group-hover/table-row:bg-transparent"
                  >
                    {formatDate(ticketConfig?.createdAt)}
                  </Table.Cell>
                  <Table.Cell
                    colSpan={2}
                    className="group-hover/table-row:bg-transparent pe-2"
                  >
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onRemove(ticketConfig?.id || '')}
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
              </Table.Body>
            )) || (
              <Table.Footer className="mt-4">
                <Table.Row className="hover:bg-background">
                  <Table.Cell
                    colSpan={12}
                    className="group-hover/table-row:bg-transparent"
                  >
                    <div className="w-full pt-3 pb-1 px-2">
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
