import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  Popover,
  RelativeDateDisplay,
  Badge,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { tagMoreColumn } from './TagsMoreColumn';
import { useState } from 'react';
import { IconTag, IconCalendar } from '@tabler/icons-react';
import { CmsTag } from '../types/tagTypes';
import { useEditTag } from '../hooks/useEditTag';
import { useIsTranslationMissing } from '../../shared/hooks/useIsTranslationMissing';
import { useAtomValue } from 'jotai';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';

export const createTagsColumns = (
  clientPortalId: string,
  onEdit?: (tag: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editTag } = useEditTag();
  const { isNonDefaultLanguage } = useIsTranslationMissing();
  const selectedLanguage = useAtomValue(cmsLanguageAtom);

  return [
    tagMoreColumn(clientPortalId, onEdit, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconTag} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as CmsTag;
        const translation = original.translations?.find(
          (item) => item.language === selectedLanguage,
        );
        const missing = isNonDefaultLanguage && !translation?.title?.trim();
        const [editingCell, setEditingCell] = useState<{
          rowId: string;
          value: string;
        } | null>(null);
        const isOpen = editingCell?.rowId === original._id;
        const currentValue =
          editingCell?.rowId === original._id && editingCell
            ? editingCell.value
            : (cell.getValue() as string);

        const onSave = async () => {
          if (currentValue !== (original.name || '')) {
            await editTag(original._id, {
              name: currentValue,
              slug: original.slug,
              clientPortalId: original.clientPortalId,
              colorCode: original.colorCode,
              ...(selectedLanguage ? { language: selectedLanguage } : {}),
            });
          }
          setEditingCell(null);
        };

        return (
          <Popover
            open={isOpen}
            onOpenChange={(v) => {
              if (v) {
                setEditingCell({
                  rowId: original._id,
                  value: cell.getValue() as string,
                });
              } else {
                onSave();
              }
            }}
          >
            <RecordTableInlineCell.Trigger>
              <Badge
                variant={missing ? 'destructive' : 'secondary'}
                className={missing ? 'border-red-300' : ''}
              >
                <TextOverflowTooltip value={cell.getValue() as string} />
              </Badge>
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content>
              <Input
                value={currentValue}
                onChange={(e) =>
                  setEditingCell({
                    rowId: original._id,
                    value: e.currentTarget.value,
                  })
                }
              />
            </RecordTableInlineCell.Content>
          </Popover>
        );
      },
    },
    {
      id: 'slug',
      header: () => <RecordTable.InlineHead icon={IconTag} label="Slug" />,
      accessorKey: 'slug',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="text-gray-500">
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created" />
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
