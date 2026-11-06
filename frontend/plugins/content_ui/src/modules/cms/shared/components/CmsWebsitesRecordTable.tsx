import {
  IconAlignLeft,
  IconCalendarPlus,
  IconEdit,
  IconFileText,
  IconLabelFilled,
  IconLanguage,
  IconLock,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
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
import { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IWebsite } from '../../types';
import { getCmsWebsiteLanguages } from './CmsWebsiteCard';
import { CONTENT_RECORD_TABLE_SCROLL_CLASS_NAME } from '@/cms/shared/constants/recordTable';

interface CmsWebsitesTableActions {
  isRestricted: (website: IWebsite) => boolean;
  onOpen: (website: IWebsite) => void;
  onManage: (website: IWebsite) => void;
}

interface CmsWebsitesRecordTableProps extends CmsWebsitesTableActions {
  websites: IWebsite[];
}

type WebsiteCellProps = CellContext<IWebsite, unknown>;

const CmsWebsitesTableContext = createContext<CmsWebsitesTableActions | null>(
  null,
);

const useCmsWebsitesTableActions = () => {
  const actions = useContext(CmsWebsitesTableContext);

  if (!actions) {
    throw new Error(
      'useCmsWebsitesTableActions must be used within CmsWebsitesRecordTable',
    );
  }

  return actions;
};

const WebsiteHead = ({ icon, label }: { icon: Icon; label?: string }) => {
  const { t } = useTranslation('content');

  return <RecordTable.InlineHead icon={icon} label={label ? t(label) : ''} />;
};

const WebsiteMoreCell = ({ row }: WebsiteCellProps) => {
  const { t } = useTranslation('content');
  const { onManage, onOpen } = useCmsWebsitesTableActions();

  return (
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
            <Command.Item value="posts" onSelect={() => onOpen(row.original)}>
              <IconFileText /> {t('posts')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const WebsiteAvatarCell = ({ row }: WebsiteCellProps) => (
  <div className="flex items-center justify-center h-8">
    <Avatar size="lg">
      <Avatar.Fallback>{row.original.name?.charAt(0)}</Avatar.Fallback>
    </Avatar>
  </div>
);

const WebsiteNameCell = ({ row }: WebsiteCellProps) => {
  const { t } = useTranslation('content');
  const { isRestricted, onOpen } = useCmsWebsitesTableActions();

  return (
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
  );
};

const WebsiteTextCell = ({ value }: { value?: string }) => (
  <RecordTableInlineCell>
    {value && <TextOverflowTooltip value={value} />}
  </RecordTableInlineCell>
);

const WebsiteLanguagesCell = ({ row }: WebsiteCellProps) => (
  <RecordTableInlineCell>
    {getCmsWebsiteLanguages(row.original)}
  </RecordTableInlineCell>
);

const WebsiteCreatedAtCell = ({ row }: WebsiteCellProps) => (
  <RelativeDateDisplay value={row.original.createdAt} asChild>
    <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
      <RelativeDateDisplay.Value value={row.original.createdAt} />
    </RecordTableInlineCell>
  </RelativeDateDisplay>
);

const CMS_WEBSITE_COLUMNS: ColumnDef<IWebsite>[] = [
  {
    id: 'more',
    cell: WebsiteMoreCell,
    size: 33,
  },
  {
    id: 'avatar',
    header: () => <WebsiteHead icon={IconWorld} />,
    cell: WebsiteAvatarCell,
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <WebsiteHead icon={IconLabelFilled} label="name" />,
    cell: WebsiteNameCell,
    size: 240,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <WebsiteHead icon={IconAlignLeft} label="description" />,
    cell: ({ row }) => <WebsiteTextCell value={row.original.description} />,
    size: 320,
  },
  {
    id: 'domain',
    accessorKey: 'domain',
    header: () => <WebsiteHead icon={IconWorld} label="domain" />,
    cell: ({ row }) => <WebsiteTextCell value={row.original.domain} />,
    size: 200,
  },
  {
    id: 'languages',
    accessorKey: 'languages',
    header: () => <WebsiteHead icon={IconLanguage} label="languages" />,
    cell: WebsiteLanguagesCell,
    size: 160,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <WebsiteHead icon={IconCalendarPlus} label="created" />,
    cell: WebsiteCreatedAtCell,
    size: 160,
  },
];

export const CmsWebsitesRecordTable = ({
  websites,
  isRestricted,
  onOpen,
  onManage,
}: CmsWebsitesRecordTableProps) => {
  const actions = useMemo(
    () => ({ isRestricted, onOpen, onManage }),
    [isRestricted, onOpen, onManage],
  );

  return (
    <CmsWebsitesTableContext.Provider value={actions}>
      <RecordTable.Provider
        columns={CMS_WEBSITE_COLUMNS}
        data={websites}
        stickyColumns={['more', 'avatar', 'name']}
        className={`m-3 ${CONTENT_RECORD_TABLE_SCROLL_CLASS_NAME}`}
        tableId="content_cms_websites_table"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Provider>
    </CmsWebsitesTableContext.Provider>
  );
};
