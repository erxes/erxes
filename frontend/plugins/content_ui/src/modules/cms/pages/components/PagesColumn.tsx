import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  RelativeDateDisplay,
  Badge,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { pageMoreColumn } from './PagesMoreColumn';
import {
  IconUser,
  IconArticle,
  IconCalendar,
  IconSitemap,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useQuery } from '@apollo/client';
import { IPage } from '../types/pageTypes';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import { CONTENT_CMS_LIST } from '../../graphql/queries';

export const usePagesColumns = (
  onEditPage?: (page: IPage) => void,
  onRefetch?: () => void,
  pages?: IPage[],
): ColumnDef<IPage>[] => {
  const navigate = useNavigate();
  const { websiteId } = useParams();
  const selectedLanguage = useAtomValue(cmsLanguageAtom);

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });
  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms: any) => cms.clientPortalId === websiteId,
  );
  const defaultLanguage: string = cmsConfig?.language || 'en';

  return [
    pageMoreColumn(onEditPage, undefined, onRefetch) as ColumnDef<IPage>,
    RecordTable.checkboxColumn as ColumnDef<IPage>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ row }) => {
        const page = row.original;
        const translatedLangs =
          page.translations?.map((t) => t.language) || [];
        const missingTranslation =
          selectedLanguage &&
          selectedLanguage !== defaultLanguage &&
          !translatedLangs.includes(selectedLanguage);
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
              <Badge variant="secondary" className={missingTranslation ? 'text-red-500' : ''}>
                <TextOverflowTooltip value={page.name} />
              </Badge>
            </div>
          </RecordTableInlineCell>
        );
      },
      size: 200,
    },
    {
      id: 'parentPage',
      header: () => (
        <RecordTable.InlineHead icon={IconSitemap} label="Parent Page" />
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
            <TextOverflowTooltip value={parent?.name || page.parentId} />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'slug',
      header: () => <RecordTable.InlineHead icon={IconArticle} label="Slug" />,
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
        <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
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
