import { memberQueries } from '@erxes/core-contract/client';
import { IconBox, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Empty,
  ListFilter,
  MemberInline,
  PageContainer,
  PageHeader,
  RecordTable,
  type RecordTableColumnDef,
  RecordTableInlineCell,
  type TListFilterField,
  useFormat,
  useOpenRecord,
  ViewBar,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type Item, ITEM_TYPE, useItems, useRemoveItem } from './useItems.ts';

/** The name opens the item in core's side panel, as a customer's name does. */
const NameCell = ({ item }: { item: Item }) => {
  const { open } = useOpenRecord();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => open({ contentType: ITEM_TYPE, contentId: item.id })}
    >
      {item.name}
    </Button>
  );
};

/** Dates and numbers go through erxes-ui's useFormat, in the UI's language. */
const UpdatedCell = ({ item }: { item: Item }) => (
  <span className="px-2">{useFormat().dateTime(item.updatedAt)}</span>
);

/** Where RecordTable keeps this list's column settings. */
const TABLE_ID = '__id___items';

const DeleteCell = ({ item }: { item: Item }) => {
  const { t } = useTranslation('__id__');
  const remove = useRemoveItem();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('delete-item', 'Delete {{name}}', { name: item.name })}
      onClick={() => remove.mutate({ id: item.id })}
    >
      <IconTrash />
    </Button>
  );
};

const columns: RecordTableColumnDef<Item>[] = [
  {
    id: 'name',
    header: 'Name',
    size: 280,
    cell: ({ row }) => <NameCell item={row.original} />,
  },
  {
    id: 'description',
    header: 'Description',
    size: 360,
    cell: ({ row }) => <span className="truncate px-2">{row.original.description}</span>,
  },
  {
    // The member's name and avatar come from core, through the core client.
    id: 'createdBy',
    header: 'Created by',
    size: 200,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <MemberInline memberId={row.original.createdBy} members={memberQueries} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'updatedAt',
    header: 'Updated',
    size: 200,
    cell: ({ row }) => <UpdatedCell item={row.original} />,
  },
  {
    id: 'delete',
    header: '',
    size: 48,
    cell: ({ row }) => <DeleteCell item={row.original} />,
  },
];

/**
 * The item list, newest first, under core's list bar: its one view, then the filter (`F`) on
 * the fields below, whose rules the API applies (`api/src/modules/items/itemFilter.ts`). Each
 * item opens in core's side panel; Add opens a new one there.
 */
export const ItemsPage = () => {
  const { t } = useTranslation('__id__');
  const { openNew } = useOpenRecord();
  const { data, isPending, error, hasNextPage, fetchNextPage } = useItems();
  const list = data?.pages.flatMap((page) => page.items) ?? [];

  const fields: TListFilterField[] = [
    { path: 'subject.name', label: t('name', 'Name'), type: 'text' },
    { path: 'subject.createdBy', label: t('created-by', 'Created by'), type: 'member' },
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <IconBox />
          <h1 className="text-sm font-semibold">{t('items', 'Items')}</h1>
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={() => openNew(ITEM_TYPE)}>
            <IconPlus />
            {t('add', 'Add item')}
          </Button>
        </PageHeader.End>
      </PageHeader>
      <ViewBar allLabel={t('all-items', 'All items')}>
        <ListFilter
          id="__id__-items"
          fields={fields}
          members={memberQueries}
          totalCount={isPending ? undefined : list.length}
          totalCapped={hasNextPage}
        />
      </ViewBar>
      {error ? (
        <p className="m-3 text-sm text-destructive">{error.message}</p>
      ) : (
        <RecordTable.Provider columns={columns} data={list} className="m-3" tableId={TABLE_ID}>
          <RecordTable.CursorProvider dataLength={list.length} hasNextPage={hasNextPage}>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                {isPending ? <RecordTable.RowSkeleton rows={8} /> : <RecordTable.RowList />}
                <RecordTable.CursorForwardSkeleton handleFetchMore={() => void fetchNextPage()} />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.CursorProvider>
          {!isPending && !list.length && (
            <Empty className="absolute inset-x-0 top-1/4">
              <Empty.Header>
                <Empty.Title>{t('empty', 'No items yet')}</Empty.Title>
              </Empty.Header>
            </Empty>
          )}
        </RecordTable.Provider>
      )}
    </PageContainer>
  );
};
