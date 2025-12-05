import {
  IconDots,
  IconNumbers,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Button, Collapsible, Table } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { Properties } from './Properties';

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
        {fieldGroups.map((group) => (
          <Collapsible className="group" defaultOpen key={group._id}>
            <Collapsible.Trigger asChild>
              <Button variant="secondary" className="w-full justify-start">
                <Collapsible.TriggerIcon />
                {group.name}
              </Button>
            </Collapsible.Trigger>

            <Collapsible.Content className="pt-2">
              <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
                <Table.Body>
                  <Properties groupId={group._id} />
                </Table.Body>
              </Table>
              <div className="flex items-center justify-end mt-2">
                <Button variant="secondary" asChild>
                  <Link to={`/settings/properties/${type}/${group._id}/add`}>
                    <IconPlus />
                    Add field
                  </Link>
                </Button>
              </div>
            </Collapsible.Content>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
