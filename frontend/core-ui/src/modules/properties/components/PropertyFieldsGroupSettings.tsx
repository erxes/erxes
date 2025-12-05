import {
  IconDots,
  IconNumbers,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Button, Collapsible, Table } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useFieldGroups } from '../hooks/useFieldGroups';

export const PropertyFieldsGroupSettings = () => {
  const { type } = useParams<{ type: string }>();

  const { fieldGroups, loading } = useFieldGroups({ contentType: type || '' });

  return (
    <div className="m-3">
      <div className="max-w-lg mx-auto flex flex-col gap-2">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Data type</Table.Head>
              <Table.Head></Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>
        <Collapsible className="group" defaultOpen>
          <Collapsible.Trigger asChild>
            <Button variant="secondary" className="w-full justify-start">
              <Collapsible.TriggerIcon />
              Erxes CSO
            </Button>
          </Collapsible.Trigger>

          <Collapsible.Content className="pt-2">
            <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
              <Table.Body>
                <Table.Row className="hover:bg-sidebar">
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full w-full justify-start hover:bg-transparent"
                      asChild
                    >
                      <div>
                        <IconUsers />
                        Employees
                      </div>
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full w-full justify-start hover:bg-transparent text-muted-foreground"
                      asChild
                    >
                      <div>
                        <IconNumbers />
                        Numbers
                      </div>
                    </Button>
                  </Table.Cell>
                  <Table.Cell className="w-8 p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-full text-muted-foreground size-7"
                    >
                      <IconDots />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Collapsible.Content>
        </Collapsible>
        <div className="flex items-center justify-end">
          <Button variant="secondary" asChild>
            <Link to={`/settings/properties/${type}/hi/add`}>
              <IconPlus />
              Add field
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
