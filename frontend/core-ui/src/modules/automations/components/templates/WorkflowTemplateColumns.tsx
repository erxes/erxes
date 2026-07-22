import { TWorkflowTemplate } from '@/automations/hooks/useWorkflowTemplateList';
import { IconArrowBarToRight, IconEdit, IconShare, IconTrash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Button,
  DropdownMenu,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TWorkflowTemplateColumnsProps = {
  onRename: (template: TWorkflowTemplate, name: string) => void;
  onRemove: (templateId: string) => void;
};

export const getWorkflowTemplateColumns = ({
  onRename,
  onRemove,
}: TWorkflowTemplateColumnsProps): ColumnDef<TWorkflowTemplate>[] => [
  {
    id: 'more',
    cell: ({ cell }) => {
      const navigate = useNavigate();
      const { confirm } = useConfirm();
      const template = cell.row.original;

      const handleRemove = () =>
        confirm({
          message: `Are you sure you want to delete the "${template.name}" template?`,
        }).then(() => onRemove(template._id));

      return (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <RecordTable.MoreButton className="h-full w-full" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="start"
            className="w-[100px] min-w-0 [&>button]:cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenu.Item
              asChild
              onSelect={() =>
                navigate(`/automations/templates/${template._id}`)
              }
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <IconEdit className="size-4" />
                Edit
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive"
                onClick={handleRemove}
              >
                <IconTrash className="size-4" />
                Delete
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );
    },
    size: 33,
    maxSize: 33,
    minSize: 33,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => {
      const currentName = cell.getValue() as string;
      const template = cell.row.original;
      const [editingName, setEditingName] = useState(currentName);
      const navigate = useNavigate();

      const handleEnter = () => {
        if (editingName === currentName || !editingName.trim()) {
          return;
        }

        onRename(template, editingName);
      };

      return (
        <PopoverScoped
          closeOnEnter
          onEnter={handleEnter}
          dependencies={[template._id, currentName, editingName]}
        >
          <RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Anchor
              onClick={() =>
                navigate(`/automations/templates/${template._id}`)
              }
            >
              <span className="truncate">{currentName}</span>
            </RecordTableInlineCell.Anchor>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
            />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      );
    },
    minSize: 150,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Description" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="truncate text-muted-foreground">
          {(cell.getValue() as string) || '—'}
        </span>
      </RecordTableInlineCell>
    ),
    minSize: 200,
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <IconShare size={12} />
        {((cell.getValue() as unknown[]) || []).length}
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'inputs',
    accessorKey: 'inputs',
    header: () => <RecordTable.InlineHead label="Inputs" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <IconArrowBarToRight size={12} />
        {Object.keys((cell.getValue() as object) || {}).length}
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label="Created at" />,
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];
