import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  Combobox,
  Command,
  ITextFieldContainerProps,
  Popover,
  RecordTable,
  RecordTableTree,
  Skeleton,
  Table,
  TextField,
  cn,
  toast,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { IconEdit, IconFolderOff, IconTrash } from '@tabler/icons-react';

import { AccountCategoriesCommandbar } from '@/settings/account/account-categories/components/AccountCategoriesCommandbar';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAccountCategory } from '@/settings/account/account-categories/components/AddAccountCategory';
import { IAccountCategory } from '@/settings/account/account-categories/types/AccountCategory';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';
import type { TFunction } from 'i18next';
import { accountCategoryDetailAtom } from '@/settings/account/account-categories/states/accountCategoryStates';
import { useAccountCategoriesRemove } from '@/settings/account/account-categories/hooks/useAccountCategoriesRemove';
import { useAccountCategoryEdit } from '@/settings/account/account-categories/hooks/useAccountCategoryEdit';
import { useFilteredAccountCategories } from '@/settings/account/account-categories/hooks/useFilteredAccountCategories';
import { useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

type AccountCategoryRow = IAccountCategory & {
  hasChildren: boolean;
  isContext?: boolean;
};

const AccountCategoriesInitialSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const { t } = useTranslation('accounting');
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {accountCategoriesColumns(t).map((col, colIndex) => (
            <Table.Cell
              key={`${rowKey}-${col.id ?? colIndex}`}
              className="border-r-0 px-2"
            >
              <Skeleton className="h-4 w-full min-w-4" />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
};

export const AccountCategoriesTable = () => {
  const { t } = useTranslation('accounting');
  const {
    allCategories: accountCategories,
    categories: visibleCategories,
    matchedIds,
    isFiltered,
    loading,
    error,
  } = useFilteredAccountCategories();
  const isInitialLoading = loading && !accountCategories?.length;

  const categoryObject = useMemo(() => {
    return (
      accountCategories?.reduce(
        (acc: Record<string, IAccountCategory>, category: IAccountCategory) => {
          acc[category._id] = category;
          return acc;
        },
        {},
      ) || {}
    );
  }, [accountCategories]);

  const isEmpty = !loading && !visibleCategories.length;
  const isFilteredEmpty = isFiltered && Boolean(accountCategories?.length);

  return (
    <RecordTable.Provider
      columns={accountCategoriesColumns(t)}
      data={
        isInitialLoading
          ? []
          : visibleCategories.map((category) => ({
              ...category,
              hasChildren: visibleCategories.some(
                (c) => c.parentId === category._id,
              ),
              isContext: isFiltered && !matchedIds.has(category._id),
            }))
      }
      stickyColumns={['more', 'checkbox', 'code']}
      tableId="accounting_account_categories_record_table"
      className="relative"
    >
      <RecordTableTree
        id="product-categories"
        ordered
        length={visibleCategories.length}
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList
                Row={(props) => (
                  <RecordTableTree.Row
                    {...props}
                    original={{
                      ...props.original,
                      ...categoryObject[props.id as string],
                    }}
                  />
                )}
              />
              {isInitialLoading && (
                <AccountCategoriesInitialSkeleton rows={20} />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
        <AccountCategoriesCommandbar />
      </RecordTableTree>
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconFolderOff}
          description={
            isFilteredEmpty
              ? t('empty-filter-description')
              : t('empty-list-description')
          }
          action={isFilteredEmpty ? undefined : <AddAccountCategory />}
        />
      )}
    </RecordTable.Provider>
  );
};

const AccountTextField = ({
  value,
  field,
  _id,
  accountCategory,
  children,
}: ITextFieldContainerProps & {
  accountCategory: AccountCategoryRow;
  children?: React.ReactNode;
}) => {
  const { isContext, ...category } = accountCategory;
  const { editAccountCategory } = useAccountCategoryEdit();

  return (
    <TextField
      value={value}
      scope={`account-category-${_id}-${field}`}
      onSave={(value) => {
        editAccountCategory({
          variables: {
            ...category,
            name: category.name ?? '',
            [field]: value,
          },
        });
      }}
      className={cn(
        'shadow-none rounded-none px-2',
        isContext && 'text-muted-foreground',
      )}
    >
      {children}
    </TextField>
  );
};

const AccountCategoryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<AccountCategoryRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState<string>('accountCategoryId');
  const setAccountCategoryDetail = useSetAtom(accountCategoryDetailAtom);
  const { confirm } = useConfirm();
  const { removeAccountCategories } = useAccountCategoriesRemove();

  const handleEdit = () => {
    setAccountCategoryDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-this-account-category'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeAccountCategories({
        variables: { _id: cell.row.original._id },
        onError: (error: Error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('account-category-deleted-successfully'),
          });
        },
      });
    });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const AccountCategoryParentCell = ({
  cell,
}: {
  cell: Cell<AccountCategoryRow, unknown>;
}) => {
  const { editAccountCategory } = useAccountCategoryEdit();
  return (
    <SelectAccountCategory
      recordId={cell.row.original._id}
      selected={cell.row.original.parentId}
      exclude={[cell.row.original._id]}
      className="w-full font-normal"
      nullable
      onSelect={(parentId) => {
        editAccountCategory({
          variables: {
            ...cell.row.original,
            name: cell.row.original.name ?? '',
            parentId,
          },
        });
      }}
      variant="ghost"
      hideChevron
    />
  );
};

const accountCategoryMoreColumn = {
  id: 'more',
  cell: AccountCategoryMoreColumnCell,
  size: 33,
};

export const accountCategoriesColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<AccountCategoryRow>[] => [
  accountCategoryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<AccountCategoryRow>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label={t('code')} />,
    cell: ({ cell }) => {
      const accountCategory = cell.row.original;
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="code"
          _id={cell.row.original._id}
          accountCategory={accountCategory}
        >
          <RecordTableTree.Trigger
            order={accountCategory.order || ''}
            name={accountCategory.name || ''}
            hasChildren={accountCategory.hasChildren}
          />
        </AccountTextField>
      );
    },
    size: 200,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="name"
          _id={cell.row.original._id}
          accountCategory={cell.row.original}
        />
      );
    },
    size: 250,
  },
  {
    id: 'parentId',
    accessorKey: 'parentId',
    header: () => <RecordTable.InlineHead label={t('parent')} />,
    cell: ({ cell }) => <AccountCategoryParentCell cell={cell} />,
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label={t('description')} />,
    cell: ({ cell }) => {
      return (
        <AccountTextField
          value={cell.getValue() as string}
          field="description"
          _id={cell.row.original._id}
          accountCategory={cell.row.original}
        />
      );
    },
    size: 300,
  },
];
