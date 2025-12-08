import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import {
  Button,
  DropdownMenu,
  IconComponent,
  Spinner,
  Table,
  useConfirm,
} from 'erxes-ui';
import { useFields } from '../hooks/useFields';
import { Link, useParams } from 'react-router';
import { FIELD_TYPES_OBJECT } from '../constants/fieldTypes';
import { useFieldRemove } from '../hooks/useFieldRemove';

export const Properties = ({ groupId }: { groupId: string }) => {
  const { type } = useParams<{ type: string }>();
  const { fields, loading } = useFields({ groupId, contentType: type || '' });
  const { confirm } = useConfirm();
  const { removeField, loading: removeFieldLoading } = useFieldRemove({
    groupId,
  });

  const handleDeleteField = (fieldId: string) => {
    confirm({
      message: 'Are you sure you want to delete this field?',
    }).then(() => {
      removeField({ variables: { id: fieldId } });
    });
  };

  if (loading)
    return (
      <Table.Row className="hover:bg-background">
        <Table.Cell
          colSpan={3}
          className="h-auto py-12 group-hover/table-row:bg-background"
        >
          <Spinner />
        </Table.Cell>
      </Table.Row>
    );

  if (fields.length === 0)
    return (
      <Table.Row className="hover:bg-background">
        <Table.Cell
          colSpan={3}
          className="h-auto py-12 text-center group-hover/table-row:bg-background"
        >
          No fields found
        </Table.Cell>
      </Table.Row>
    );

  return (
    <>
      {fields.map((field) => (
        <Table.Row className="hover:bg-sidebar" key={field._id}>
          <Table.Cell>
            <Button
              variant="ghost"
              size="sm"
              className="h-full w-full justify-start hover:bg-transparent"
              asChild
            >
              <div>
                <IconComponent name={field.icon} />
                {field.name}
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
                {
                  FIELD_TYPES_OBJECT[
                    field.type as keyof typeof FIELD_TYPES_OBJECT
                  ].icon
                }
                {
                  FIELD_TYPES_OBJECT[
                    field.type as keyof typeof FIELD_TYPES_OBJECT
                  ].label
                }
              </div>
            </Button>
          </Table.Cell>
          <Table.Cell className="w-8 p-0.5">
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-full text-muted-foreground size-7"
                >
                  <IconDots />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="min-w-48">
                <DropdownMenu.Item asChild>
                  <Link
                    to={`/settings/properties/${type}/${groupId}/${field._id}`}
                  >
                    <IconEdit />
                    Edit
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="text-destructive"
                  disabled={removeFieldLoading}
                  onClick={() => handleDeleteField(field._id)}
                >
                  {removeFieldLoading ? <Spinner /> : <IconTrash />}
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </Table.Cell>
        </Table.Row>
      ))}
    </>
  );
};
