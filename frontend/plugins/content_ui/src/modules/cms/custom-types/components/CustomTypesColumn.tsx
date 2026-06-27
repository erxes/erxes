import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  Popover,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { customTypeMoreColumn } from './CustomTypesMoreColumn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconLayout, IconCalendar, IconArticle } from '@tabler/icons-react';
import { ICustomPostType } from '../types/customTypeTypes';
import { useEditCustomType } from '../hooks/useEditCustomType';

interface CustomTypeNameCellProps {
  cell: Cell<ICustomPostType, unknown>;
  websiteId: string;
  onRefetch?: () => void;
}

const CustomTypeNameCell = ({
  cell,
  websiteId,
  onRefetch,
}: CustomTypeNameCellProps) => {
  const original = cell.row.original;
  const [editingValue, setEditingValue] = useState<string>();
  const { editType } = useEditCustomType(onRefetch);
  const isOpen = editingValue !== undefined;
  const currentValue = editingValue ?? String(cell.getValue() || '');

  const onSave = async () => {
    const trimmedValue = currentValue.trim();
    if (!trimmedValue) {
      setEditingValue(undefined);
      return;
    }

    if (trimmedValue !== (original.label || '')) {
      await editType({
        variables: {
          _id: original._id,
          input: {
            label: trimmedValue,
            pluralLabel: original.pluralLabel,
            code: original.code,
            description: original.description,
            clientPortalId: websiteId,
          },
        },
      });
    }
    setEditingValue(undefined);
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setEditingValue(String(cell.getValue() || ''));
        } else {
          void onSave();
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <span className="leading-normal">{String(cell.getValue() || '')}</span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={currentValue}
          onChange={(event) => setEditingValue(event.currentTarget.value)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

export const useCustomTypesColumns = (
  websiteId: string,
  onEdit?: (customType: ICustomPostType) => void,
  onRefetch?: () => void,
): ColumnDef<ICustomPostType>[] => {
  const { t } = useTranslation('content');

  return [
    customTypeMoreColumn(onEdit, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<ICustomPostType>,
    {
      id: 'name',
      header: () => (
        <RecordTable.InlineHead icon={IconLayout} label={t('type-name')} />
      ),
      accessorKey: 'label',
      cell: ({ cell }) => (
        <CustomTypeNameCell
          cell={cell}
          websiteId={websiteId}
          onRefetch={onRefetch}
        />
      ),
    },
    {
      id: 'description',
      header: () => (
        <RecordTable.InlineHead icon={IconArticle} label={t('description')} />
      ),
      accessorKey: 'description',
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={cell.getValue() as string}
            className="leading-normal"
          />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label={t('created')} />
      ),
      accessorKey: 'createdAt',
      size: 120,
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
    },
  ];
};
