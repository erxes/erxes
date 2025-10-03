import { Cell, ColumnDef } from '@tanstack/table-core';
import { IAccountCategory } from '../types/AccountCategory';
import {
  ITextFieldContainerProps,
  RecordTable,
  RecordTableTree,
  TextField,
  useQueryState,
} from 'erxes-ui';
import { useAccountCategories } from '../hooks/useAccountCategories';
import { useAccountCategoryEdit } from '../hooks/useAccountCategoryEdit';
import { SelectAccountCategory } from './SelectAccountCategory';
import { useSetAtom } from 'jotai';
import { accountCategoryDetailAtom } from '../states/accountCategoryStates';
import { AccountCategoriesCommandbar } from './AccountCategoriesCommandbar';
import { useMemo } from 'react';

export const AccountCategoriesTable = () => {
  const { accountCategories } = useAccountCategories();

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
        accountCategories?.map((category) => ({
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
  const [, setOpen] = useQueryState('accountCategoryId');
  const setAccountCategoryDetail = useSetAtom(accountCategoryDetailAtom);
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setAccountCategoryDetail(cell.row.original);
        setOpen(cell.row.original._id);
      }}
    />
  );
};

export const accountCategoryMoreColumn = {
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
    header: () => <RecordTable.InlineHead label="Code" />,
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
    header: () => <RecordTable.InlineHead label="Name" />,
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
    header: () => <RecordTable.InlineHead label="Parent" />,
    cell: ({ cell }) => <AccountCategoryParentCell cell={cell} />,
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Description" />,
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
