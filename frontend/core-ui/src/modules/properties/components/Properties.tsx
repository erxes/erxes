import {
  IconDots,
  IconEdit,
  IconNumbers,
  IconUsers,
} from '@tabler/icons-react';
import { Button, DropdownMenu, IconComponent, Table } from 'erxes-ui';
import { useFields } from '../hooks/useFields';
import { Link, useParams } from 'react-router';
import { FIELD_TYPES_OBJECT } from '../constants/fieldTypes';

export const Properties = ({ groupId }: { groupId: string }) => {
  const { type } = useParams<{ type: string }>();
  const { fields, loading } = useFields({ groupId, contentType: type || '' });

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
              <DropdownMenu.Content>
                <DropdownMenu.Item asChild>
                  <Link
                    to={`/settings/properties/${type}/${groupId}/${field._id}`}
                  >
                    <IconEdit />
                    Edit
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </Table.Cell>
        </Table.Row>
      ))}
    </>
  );
};
