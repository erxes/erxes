import { useWorkflowTemplateActions } from '@/automations/hooks/useWorkflowTemplateActions';
import { TWorkflowTemplate } from '@/automations/hooks/useWorkflowTemplateList';
import {
  IconArrowBarToRight,
  IconEdit,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Button,
  DropdownMenu,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useWorkflowTemplateNameCell } from '@/automations/hooks/useWorkflowTemplateNameCell';

type TTranslate = (key: string, options?: Record<string, unknown>) => string;

type TWorkflowTemplateColumnsProps = {
  t: TTranslate;
  onRename: (template: TWorkflowTemplate, name: string) => void;
  onRemove: (templateId: string) => void;
};

const EMPTY_VALUE = '—';

const countOf = (items?: unknown[]) => (items || []).length;

const WorkflowTemplateMoreCell = ({
  template,
  onRemove,
  t,
}: {
  template: TWorkflowTemplate;
  onRemove: (templateId: string) => void;
  t: TTranslate;
}) => {
  const actions = useWorkflowTemplateActions({ template, onRemove });

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
        <DropdownMenu.Item asChild onSelect={actions.onEdit}>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <IconEdit className="size-4" />
            {t('edit')}
          </Button>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            onClick={actions.onRemove}
          >
            <IconTrash className="size-4" />
            {t('delete')}
          </Button>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const WorkflowTemplateNameCell = ({
  template,
  onRename,
}: {
  template: TWorkflowTemplate;
  onRename: (template: TWorkflowTemplate, name: string) => void;
}) => {
  const { currentName, editingName, setEditingName, rename, openTemplate } =
    useWorkflowTemplateNameCell(template, onRename);

  return (
    <PopoverScoped
      closeOnEnter
      onEnter={rename}
      dependencies={[template._id, currentName, editingName]}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor onClick={openTemplate}>
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
};

export const getWorkflowTemplateColumns = ({
  t,
  onRename,
  onRemove,
}: TWorkflowTemplateColumnsProps): ColumnDef<TWorkflowTemplate>[] => [
  {
    id: 'more',
    cell: ({ cell }) => (
      <WorkflowTemplateMoreCell
        template={cell.row.original}
        onRemove={onRemove}
        t={t}
      />
    ),
    size: 33,
    maxSize: 33,
    minSize: 33,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => (
      <WorkflowTemplateNameCell
        template={cell.row.original}
        onRename={onRename}
      />
    ),
    minSize: 150,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label={t('description')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="truncate text-muted-foreground">
          {cell.row.original.description || EMPTY_VALUE}
        </span>
      </RecordTableInlineCell>
    ),
    minSize: 200,
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: () => <RecordTable.InlineHead label={t('actions')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <IconShare size={12} />
        {countOf(cell.row.original.actions)}
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'inputs',
    accessorKey: 'inputs',
    header: () => <RecordTable.InlineHead label={t('inputs')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <IconArrowBarToRight size={12} />
        {countOf(Object.keys(cell.row.original.inputs || {}))}
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label={t('created-at')} />,
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];
