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
import { CmsTag } from '@/cms/tags/types/tagTypes';
import { useEditTag } from '@/cms/tags/hooks/useEditTag';
import { useIsTranslationMissing } from '@/cms/shared/hooks/useIsTranslationMissing';
import { useAtomValue } from 'jotai';
import { cmsLanguageAtom } from '@/cms/shared/states/cmsLanguageState';
import { getTranslation } from '@/cms/shared/utils';

/**
 * Hook that creates column definitions for the CMS tags table.
 * @param clientPortalId - The ID of the client portal.
 * @param onEdit - Optional callback for editing a tag.
 * @param onRefetch - Optional callback for refetching tags.
 * @returns An array of column definitions.
 */
export const useTagsColumns = (
  clientPortalId: string,
  onEdit?: (tag: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editTag } = useEditTag();
  const { isNonDefaultLanguage } = useIsTranslationMissing();
  const selectedLanguage = useAtomValue(cmsLanguageAtom);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    value: string;
  } | null>(null);

  return [
    tagMoreColumn(clientPortalId, onEdit, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconTag} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as CmsTag;
        const translation = getTranslation(
          original.translations,
          selectedLanguage,
        );
        const missing = isNonDefaultLanguage && !translation?.title?.trim();

        const isOpen = editingCell?.rowId === original._id;
        const currentValue =
          editingCell?.rowId === original._id && editingCell
            ? editingCell.value
            : (cell.getValue() as string);

        const onSave = async () => {
          const trimmedValue = currentValue.trim();
          if (!trimmedValue) {
            setEditingCell(null);
            return;
          }

          const existingValue =
            translation?.title || (selectedLanguage ? '' : original.name) || '';

          if (trimmedValue !== existingValue) {
            await editTag(original._id, {
              name: trimmedValue,
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
                <TextOverflowTooltip
                  value={cell.getValue() as string}
                  className="leading-normal"
                />
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
        <RecordTableInlineCell className="text-muted-foreground">
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

