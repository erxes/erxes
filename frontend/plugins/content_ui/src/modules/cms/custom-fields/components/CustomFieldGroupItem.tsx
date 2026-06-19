import { Button, Table, DropdownMenu, Collapsible } from 'erxes-ui';
import { IconEdit, IconTrash, IconDots, IconPlus } from '@tabler/icons-react';
import {
  ICustomFieldGroup,
  ICustomField,
  FIELD_TYPES_OBJECT,
} from '../types/customFieldTypes';

interface CustomFieldGroupItemProps {
  group: ICustomFieldGroup;
  selectedGroupId: string | null;
  onSelectGroup: (group: ICustomFieldGroup) => void;
  onEditGroup: (group: ICustomFieldGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditField: (field: ICustomField) => void;
  onDeleteField: (fieldId: string) => void;
  onAddField: () => void;
}

export function CustomFieldGroupItem({
  group,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
  onEditField,
  onDeleteField,
  onAddField,
}: CustomFieldGroupItemProps) {
  return (
    <Collapsible
      key={group._id}
      className="group"
      defaultOpen={selectedGroupId === group._id}
      onOpenChange={(open) => open && onSelectGroup(group)}
    >
      <div className="relative">
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full justify-start">
            <Collapsible.TriggerIcon />
            <span className="truncate leading-normal">{group.label}</span>
          </Button>
        </Collapsible.Trigger>
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
            <DropdownMenu.Item onClick={() => onEditGroup(group)}>
              <IconEdit />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-destructive"
              onClick={() => onDeleteGroup(group._id)}
            >
              <IconTrash />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      <Collapsible.Content className="pt-2">
        <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
          <Table.Body>
            {(group.fields || []).length === 0 ? (
              <Table.Row className="hover:bg-background">
                <Table.Cell
                  colSpan={3}
                  className="h-auto py-12 text-center text-muted-foreground"
                >
                  No fields found
                </Table.Cell>
              </Table.Row>
            ) : (
              (group.fields || []).map((field: ICustomField) => {
                const fieldTypeObject = FIELD_TYPES_OBJECT[field.type];
                return (
                  <Table.Row key={field._id} className="hover:bg-sidebar">
                    <Table.Cell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-full w-full justify-start hover:bg-transparent"
                        asChild
                      >
                        <div>
                          {fieldTypeObject?.icon}
                          {field.label}
                          {field.isRequired && (
                            <span className="text-destructive">*</span>
                          )}
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
                        <div>{fieldTypeObject?.label || field.type}</div>
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
                          <DropdownMenu.Item onClick={() => onEditField(field)}>
                            <IconEdit />
                            Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="text-destructive"
                            onClick={() => onDeleteField(field._id)}
                          >
                            <IconTrash />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
        <div className="flex items-center justify-end mt-2">
          <Button variant="secondary" onClick={onAddField}>
            <IconPlus />
            Add field
          </Button>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}
