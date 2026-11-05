import {
  IconAlignLeft,
  IconCalendarPlus,
  IconEdit,
  IconFileText,
  IconLabelFilled,
  IconLanguage,
  IconLock,
  IconWorld,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IWebsite } from '../../types';
import { getCmsWebsiteLanguages } from './CmsWebsiteCard';

interface CmsWebsitesRecordTableProps {
  websites: IWebsite[];
  isRestricted: (website: IWebsite) => boolean;
  onOpen: (website: IWebsite) => void;
  onManage: (website: IWebsite) => void;
}

export const CmsWebsitesRecordTable = ({
  websites,
  isRestricted,
  onOpen,
  onManage,
}: CmsWebsitesRecordTableProps) => {
  const { t } = useTranslation('content');

  const columns = useMemo<ColumnDef<IWebsite>[]>(
    () => [
      {
        id: 'more',
        cell: ({ row }) => (
          <Popover>
            <Popover.Trigger asChild>
              <RecordTable.MoreButton className="w-full h-full" />
            </Popover.Trigger>
            <Combobox.Content>
              <Command shouldFilter={false}>
                <Command.List>
                  <Command.Item
                    value="manage"
                    onSelect={() => onManage(row.original)}
                  >
                    <IconEdit /> {t('manage')}
                  </Command.Item>
                  <Command.Item
                    value="posts"
                    onSelect={() => onOpen(row.original)}
                  >
                    <IconFileText /> {t('posts')}
                  </Command.Item>
                </Command.List>
              </Command>
            </Combobox.Content>
          </Popover>
        ),
        size: 33,
      },
      {
        id: 'avatar',
        header: () => <RecordTable.InlineHead icon={IconWorld} label="" />,
        cell: ({ row }) => (
          <div className="flex items-center justify-center h-8">
            <Avatar size="lg">
              <Avatar.Fallback>{row.original.name?.charAt(0)}</Avatar.Fallback>
            </Avatar>
          </div>
        ),
        size: 34,
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: () => (
          <RecordTable.InlineHead icon={IconLabelFilled} label={t('name')} />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <RecordTableInlineCell.Anchor onClick={() => onOpen(row.original)}>
              {row.original.name}
            </RecordTableInlineCell.Anchor>
            {isRestricted(row.original) && (
              <IconLock
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label={t('restricted')}
              />
            )}
          </RecordTableInlineCell>
        ),
        size: 240,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: () => (
          <RecordTable.InlineHead
            icon={IconAlignLeft}
            label={t('description')}
          />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            {row.original.description && (
              <TextOverflowTooltip value={row.original.description} />
            )}
          </RecordTableInlineCell>
        ),
        size: 320,
      },
      {
        id: 'domain',
        accessorKey: 'domain',
        header: () => (
          <RecordTable.InlineHead icon={IconWorld} label={t('domain')} />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            {row.original.domain && (
              <TextOverflowTooltip value={row.original.domain} />
            )}
          </RecordTableInlineCell>
        ),
        size: 200,
      },
      {
        id: 'languages',
        accessorKey: 'languages',
        header: () => (
          <RecordTable.InlineHead icon={IconLanguage} label={t('languages')} />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            {getCmsWebsiteLanguages(row.original)}
          </RecordTableInlineCell>
        ),
        size: 160,
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: () => (
          <RecordTable.InlineHead
            icon={IconCalendarPlus}
            label={t('created')}
          />
        ),
        cell: ({ row }) => (
          <RelativeDateDisplay value={row.original.createdAt} asChild>
            <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
              <RelativeDateDisplay.Value value={row.original.createdAt} />
            </RecordTableInlineCell>
          </RelativeDateDisplay>
        ),
        size: 160,
      },
    ],
    [t, isRestricted, onOpen, onManage],
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={websites}
      stickyColumns={['more', 'avatar', 'name']}
      className="m-3"
      tableId="content_cms_websites_table"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
