import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  RelativeDateDisplay,
  Popover,
  Badge,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { categoryMoreColumn } from './CategoriesMoreColumn';
import { useState } from 'react';
import {
  IconUser,
  IconArticle,
  IconFolder,
  IconCalendarPlus,
} from '@tabler/icons-react';
import { ICategory } from '@/cms/categories/types/CategoriesType';
import { useEditCategory } from '@/cms/categories/hooks/useEditCategory';
import { useIsTranslationMissing } from '@/cms/shared/hooks/useIsTranslationMissing';
import { CmsTranslatableBadge } from '@/cms/shared/components/CmsTranslatableBadge';
import { useAtomValue } from 'jotai';
import { cmsLanguageAtom } from '@/cms/shared/states/cmsLanguageState';
import { getTranslation } from '@/cms/shared/utils';

function getDepthPrefix(depth: number): string {
  if (depth <= 0) return '';
  return '-'.repeat(depth) + ' ';
}

/**
 * Hook that creates column definitions for the CMS categories table.
 * @param clientPortalId - The ID of the client portal.
 * @param onEdit - Optional callback for editing a category.
 * @param onRefetch - Optional callback for refetching categories.
 * @returns An array of column definitions.
 */
export const useCategoriesColumns = (
  clientPortalId: string,
  onEdit?: (category: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editCategory } = useEditCategory();
  const { isMissing, isNonDefaultLanguage } = useIsTranslationMissing();
  const selectedLanguage = useAtomValue(cmsLanguageAtom);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    value: string;
  } | null>(null);

  return [
    categoryMoreColumn(clientPortalId, onEdit, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as ICategory & { _depth?: number };
        const translation = getTranslation(
          original.translations,
          selectedLanguage,
        );
        const missing = isMissing(original.translations);

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
            await editCategory({
              variables: {
                _id: original._id,
                input: {
                  name: trimmedValue,
                  ...(selectedLanguage ? { language: selectedLanguage } : {}),
                },
              },
            });
          }
          setEditingCell(null);
        };

        const prefix = getDepthPrefix(original._depth ?? 0);

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
              <CmsTranslatableBadge
                value={cell.getValue() as string}
                missing={missing}
                placeholder="Untitled category"
                prefix={prefix}
                missingVariant="destructive"
                missingClassName="border-red-300"
              />
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
      id: 'description',
      header: () => (
        <RecordTable.InlineHead icon={IconArticle} label="Description" />
      ),
      accessorKey: 'description',
      cell: ({ cell, row }) => {
        const category = row.original as ICategory;
        const translation = getTranslation(
          category.translations,
          selectedLanguage,
        );
        const missing = isNonDefaultLanguage && !translation?.content?.trim();
        const value = cell.getValue() as string;

        if (!value?.trim()) {
          return (
            <RecordTableInlineCell>
              <span className="italic text-muted-foreground">
                No description
              </span>
            </RecordTableInlineCell>
          );
        }

        if (missing) {
          return (
            <RecordTableInlineCell>
              <Badge variant="destructive" className="border-red-300">
                <TextOverflowTooltip value={value} className="leading-normal" />
              </Badge>
            </RecordTableInlineCell>
          );
        }

        return <RecordTableInlineCell>{value}</RecordTableInlineCell>;
      },
    },
    {
      id: 'parent',
      header: () => <RecordTable.InlineHead icon={IconFolder} label="Parent" />,
      accessorKey: 'parentId',
      cell: ({ row }) => {
        const getParentName = (parent: any): string => {
          if (!parent) return '';
          // If there's a parent with a name, return it
          if (parent.name) return parent.name;
          // If there's a nested parent, recursively get its name
          if (parent.parent) return getParentName(parent.parent);
          return '';
        };

        const parentName = getParentName(row.original.parent);

        return <RecordTableInlineCell>{parentName}</RecordTableInlineCell>;
      },
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendarPlus} label="Created At" />
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

