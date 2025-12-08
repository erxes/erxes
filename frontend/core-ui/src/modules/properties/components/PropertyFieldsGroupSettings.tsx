import { IconDots, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  DropdownMenu,
  Spinner,
  Table,
  useConfirm,
} from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { Properties } from './Properties';
import { useFieldGroupRemove } from '../hooks/useFieldGroupRemove';
import { PropertyGroupEditSheet } from './PropertyGroupEdit';
import { activePropertyState } from '../states/activePropertyState';
import { useSetAtom } from 'jotai';
import { IFieldGroup } from '../types/Properties';

export const PropertyFieldsGroupSettings = () => {
  const { type } = useParams<{ type: string }>();

  const { fieldGroups } = useFieldGroups({ contentType: type || '' });

  return (
    <>
      <PropertyGroupEditSheet />
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
              <div className="relative">
                <Collapsible.Trigger asChild>
                  <Button variant="secondary" className="w-full justify-start">
                    <Collapsible.TriggerIcon />
                    {group.name}
                  </Button>
                </Collapsible.Trigger>
                <FieldGroupSettingsDropdown
                  groupId={group._id}
                  contentType={type || ''}
                  group={group}
                />
              </div>

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
    </>
  );
};

export const FieldGroupSettingsDropdown = ({
  groupId,
  contentType,
  group,
}: {
  groupId: string;
  contentType: string;
  group: IFieldGroup;
}) => {
  const { removeFieldGroup, loading } = useFieldGroupRemove({ contentType });
  const setActivePropertyGroup = useSetAtom(activePropertyState);

  const { confirm } = useConfirm();
  const handleDeleteFieldGroup = () => {
    confirm({
      message: 'Are you sure you want to delete this field group?',
    }).then(() => removeFieldGroup(groupId));
  };
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0.5 top-0.5 size-6 px-0"
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-48">
        <DropdownMenu.Item onClick={() => setActivePropertyGroup(group)}>
          <IconEdit />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="text-destructive"
          disabled={loading}
          onClick={handleDeleteFieldGroup}
        >
          {loading ? <Spinner size="sm" /> : <IconTrash />}
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
