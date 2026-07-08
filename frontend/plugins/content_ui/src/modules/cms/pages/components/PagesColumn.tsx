import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { pageMoreColumn } from './PagesMoreColumn';
import {
  IconUser,
  IconArticle,
  IconCalendar,
  IconSitemap,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IPage } from '../types/pageTypes';
import { useIsTranslationMissing } from '../../shared/hooks/useIsTranslationMissing';
import { CmsTranslatableBadge } from '../../shared/components/CmsTranslatableBadge';

export const usePagesColumns = (
  onEditPage?: (page: IPage) => void,
  onRefetch?: () => void,
  pages?: IPage[],
): ColumnDef<IPage>[] => {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const { isMissing } = useIsTranslationMissing();

  return [
    pageMoreColumn(onEditPage, undefined, onRefetch) as ColumnDef<IPage>,
    RecordTable.checkboxColumn as ColumnDef<IPage>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label={t('name')} />,
      accessorKey: 'name',
      cell: ({ row }) => {
        const page = row.original as IPage & {
          translations?: { language: string }[];
        };
        const missing = isMissing(page.translations);
        return (
          <RecordTableInlineCell>
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/content/cms/${page.clientPortalId}/pages/detail/${page._id}`,
                );
              }}
              className="cursor-pointer"
            >
              <CmsTranslatableBadge
                value={page.name}
                missing={missing}
                placeholder={t('untitled-page')}
              />
            </div>
          </RecordTableInlineCell>
        );
      },
      size: 200,
    },
    {
      id: 'parentPage',
      header: () => (
        <RecordTable.InlineHead icon={IconSitemap} label={t('parent-page')} />
      ),
      accessorKey: 'parentId',
      cell: ({ row }) => {
        const page = row.original;
        if (!page.parentId) {
          return (
            <RecordTableInlineCell className="text-muted-foreground"></RecordTableInlineCell>
          );
        }
        const parent = pages?.find((p) => p._id === page.parentId);
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip
              value={parent?.name || page.parentId}
              className="leading-normal"
            />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'slug',
      header: () => <RecordTable.InlineHead icon={IconArticle} label={t('slug')} />,
      accessorKey: 'slug',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="text-gray-500">
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
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
    },
    {
      id: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label={t('updated')} />
      ),
      accessorKey: 'updatedAt',
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
