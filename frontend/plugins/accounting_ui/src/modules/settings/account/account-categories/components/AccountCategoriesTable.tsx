import { Cell, ColumnDef } from '@tanstack/table-core';
import { IAccountCategory } from '../types/AccountCategory';
import {
  ITextFieldContainerProps,
  RecordTable,
  RecordTableTree,
  Skeleton,
  Table,
  TextField,
  useQueryState,
  Popover,
  Combobox,
  Command,
  useConfirm,
  toast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAccountCategories } from '../hooks/useAccountCategories';
import { useAccountCategoryEdit } from '../hooks/useAccountCategoryEdit';
import { useAccountCategoriesRemove } from '../hooks/useAccountCategoriesRemove';
import { SelectAccountCategory } from './SelectAccountCategory';
import { useSetAtom } from 'jotai';
import { accountCategoryDetailAtom } from '../states/accountCategoryStates';
import { AccountCategoriesCommandbar } from './AccountCategoriesCommandbar';
import { useMemo } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';

const AccountCategoriesInitialSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {accountCategoriesColumns.map((col, colIndex) => (
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
  const { accountCategories, loading } = useAccountCategories();
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

  return (
    <RecordTable.Provider
      columns={accountCategoriesColumns}
      data={
        isInitialLoading
          ? []
          : accountCategories?.map((category) => ({
              ...category,
              hasChildren: accountCategories.some(
                (c) => c.parentId === category._id,
              ),
            })) || []
      }
      stickyColumns={['more', 'checkbox', 'code']}
    >
      <RecordTableTree id="product-categories" ordered>
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
  accountCategory: IAccountCategory & { hasChildren: boolean };
  children?: React.ReactNode;
}) => {
  const { editAccountCategory } = useAccountCategoryEdit();

  return (
    <TextField
      value={value}
      scope={`account-category-${_id}-${field}`}
      onSave={(value) => {
        editAccountCategory({
          variables: { ...accountCategory, [field]: value },
        });
      }}
      className={'shadow-none rounded-none px-2'}
    >
      {children}
    </TextField>
  );
};

const AccountCategoryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAccountCategory & { hasChildren: boolean }, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState('accountCategoryId');
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
  cell: Cell<IAccountCategory & { hasChildren: boolean }, unknown>;
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

export const accountCategoriesColumns: ColumnDef<
  IAccountCategory & { hasChildren: boolean }
>[] = [
  accountCategoryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<
    IAccountCategory & { hasChildren: boolean }
  >,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Код" />,
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
    header: () => <RecordTable.InlineHead label="Нэр" />,
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
    header: () => <RecordTable.InlineHead label="Эцэг" />,
    cell: ({ cell }) => <AccountCategoryParentCell cell={cell} />,
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Тайлбар" />,
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
