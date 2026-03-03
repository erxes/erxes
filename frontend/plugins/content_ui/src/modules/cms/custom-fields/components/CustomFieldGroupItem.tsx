import { Button, Table, DropdownMenu, Collapsible } from 'erxes-ui';
import { IconEdit, IconTrash, IconDots, IconPlus } from '@tabler/icons-react';
import { ICustomFieldGroup, ICustomField } from '../types/customFieldTypes';

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
            <span className="flex-1 text-left">{group.label}</span>
            {group.code && (
              <span className="text-xs text-muted-foreground mr-2">
                {group.code}
              </span>
            )}
          </Button>
        </Collapsible.Trigger>
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0.5 top-0.5 size-7"
            >
              <IconDots className="w-4 h-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="min-w-48">
            <DropdownMenu.Item onClick={() => onEditGroup(group)}>
              <IconEdit className="w-4 h-4" />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-destructive"
              onClick={() => onDeleteGroup(group._id)}
            >
              <IconTrash className="w-4 h-4" />
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
                  className="h-auto py-8 text-center text-muted-foreground"
                >
                  No fields in this group
                </Table.Cell>
              </Table.Row>
            ) : (
              (group.fields || []).map((field: ICustomField) => (
                <Table.Row key={field._id} className="hover:bg-accent/50">
                  <Table.Cell className="py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base">
                            {field.label}
                          </span>
                          {field.isRequired && (
                            <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium">
                              Required
                            </span>
                          )}
                        </div>
                        {field.code && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                              Code:
                            </span>
                            <code className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono">
                              {field.code}
                            </code>
                          </div>
                        )}
                        {field.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {field.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="py-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md">
                      <span className="text-sm font-medium capitalize">
                        {field.type}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="w-8 p-0.5">
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                        >
                          <IconDots className="w-4 h-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content className="min-w-48">
                        <DropdownMenu.Item onClick={() => onEditField(field)}>
                          <IconEdit className="w-4 h-4" />
                          Edit field
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="text-destructive"
                          onClick={() => onDeleteField(field._id)}
                        >
                          <IconTrash className="w-4 h-4" />
                          Delete field
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
        <div className="flex items-center justify-end mt-2">
          <Button variant="secondary" onClick={onAddField}>
            <IconPlus className="w-4 h-4" />
            Add field
          </Button>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}
