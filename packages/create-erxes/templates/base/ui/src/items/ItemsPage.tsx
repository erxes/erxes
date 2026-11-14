import { IconBox, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Empty,
  PageContainer,
  PageHeader,
  RecordTable,
  type RecordTableColumnDef,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ItemSheet } from './ItemSheet.tsx';
import { type Item, useItems, useOpenItem, useRemoveItem } from './useItems.ts';

const NameCell = ({ item }: { item: Item }) => {
  const { open } = useOpenItem();

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={() => open(item.id)}>
      {item.name}
    </Button>
  );
};

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
    id: 'updatedAt',
    header: 'Updated',
    size: 200,
    cell: ({ row }) => <span className="px-2">{row.original.updatedAt.toLocaleString()}</span>,
  },
  {
    id: 'delete',
    header: '',
    size: 48,
    cell: ({ row }) => <DeleteCell item={row.original} />,
  },
];

/** The item list, newest first, with each item opening in the side panel. */
export const ItemsPage = () => {
  const { t } = useTranslation('__id__');
  const { open } = useOpenItem();
  const { data, isPending, error, hasNextPage, fetchNextPage } = useItems();
  const list = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <IconBox />
          <h1 className="text-sm font-semibold">{t('items', 'Items')}</h1>
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={() => open('new')}>
            <IconPlus />
            {t('add', 'Add item')}
          </Button>
        </PageHeader.End>
      </PageHeader>
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
            <Empty className="absolute inset-x-0 top-[25%]">
              <Empty.Header>
                <Empty.Title>{t('empty', 'No items yet')}</Empty.Title>
              </Empty.Header>
            </Empty>
          )}
        </RecordTable.Provider>
      )}
      <ItemSheet items={list} />
    </PageContainer>
  );
};
