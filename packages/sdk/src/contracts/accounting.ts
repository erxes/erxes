import * as z from 'zod';
import { defineContract } from './define';

// accounting@1. Additive changes (a new entry, a new optional input field, a new
// output field) may extend v1. Anything that would break an extension written
// against v1 (removing or renaming an entry or field, tightening an input,
// changing what a field means) ships as accounting@2 instead, and v1 stays served
// while any install pins it.

// z.object strips fields it doesn't declare, so a call returns only these.
const Account = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  name: z.string().nullable(),
  status: z.string().nullable(),
  currency: z.string().nullable(),
  kind: z.string().nullable(),
  journal: z.string().nullable(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  parentId: z.string().nullable(),
  branchId: z.string().nullable(),
  departmentId: z.string().nullable(),
  isTemp: z.boolean().nullable(),
  isOutBalance: z.boolean().nullable(),
  createdAt: z.string().nullable(),
});

const AccountCategory = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  status: z.string().nullable(),
});

const Transaction = z.object({
  _id: z.string(),
  number: z.string().nullable(),
  date: z.string().nullable(),
  description: z.string().nullable(),
  journal: z.string().nullable(),
  status: z.string().nullable(),
  parentId: z.string().nullable(),
  ptrId: z.string().nullable(),
  ptrNumber: z.string().nullable(),
  ptrStatus: z.string().nullable(),
  branchId: z.string().nullable(),
  departmentId: z.string().nullable(),
  customerId: z.string().nullable(),
  sumDt: z.number().nullable(),
  sumCt: z.number().nullable(),
  createdAt: z.string().nullable(),
});

const VatRow = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  number: z.string().nullable(),
  kind: z.string().nullable(),
  formula: z.string().nullable(),
  formulaText: z.string().nullable(),
  percent: z.number().nullable(),
  isBold: z.boolean().nullable(),
  status: z.string().nullable(),
});

const CtaxRow = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  number: z.string().nullable(),
  kind: z.string().nullable(),
  formula: z.string().nullable(),
  formulaText: z.string().nullable(),
  percent: z.number().nullable(),
  status: z.string().nullable(),
});

const FixedAssetCategory = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  status: z.string().nullable(),
});

const FixedAsset = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  name: z.string().nullable(),
  categoryId: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  accountId: z.string().nullable(),
  count: z.number().nullable(),
  currentCount: z.number().nullable(),
  originalCost: z.number().nullable(),
  acquisitionDate: z.string().nullable(),
});

const accountKind = z.enum(['active', 'passive']);

const accountJournal = z.enum([
  'main',
  'tax',
  'cash',
  'bank',
  'debt',
  'exchangeDiff',
  'inventory',
  'invFollow',
  'fixedAsset',
  'fxaFollow',
]);

const vatRowKind = z.enum(['normal', 'formula', 'title', 'hidden', 'free']);

const ctaxRowKind = z.enum(['normal', 'formula', 'title', 'hidden']);

export const accountingContract = defineContract('accounting', 1, [
  {
    name: 'accounts.list',
    description:
      'Read one page of accounts in the chart of accounts, ordered by code. searchValue filters by text, categoryId by account category, kind by active or passive. Pages are perPage rows (max 50). Use accounts.count for the total. Read-only.',
    kind: 'read',
    field: 'accounts',
    args: {
      searchValue: 'String',
      categoryId: 'String',
      kind: 'String',
      page: 'Int',
      perPage: 'Int',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        categoryId: z.string().optional(),
        kind: accountKind.optional(),
        page: z.number().int().min(1).optional(),
        perPage: z.number().int().min(1).max(50).optional(),
      })
      .strict(),
    output: z.array(Account),
  },
  {
    name: 'accounts.count',
    description:
      'Count accounts matching the same filters as accounts.list. Read-only.',
    kind: 'read',
    field: 'accountsCount',
    args: {
      searchValue: 'String',
      categoryId: 'String',
      kind: 'String',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        categoryId: z.string().optional(),
        kind: accountKind.optional(),
      })
      .strict(),
    output: z.number(),
  },
  {
    name: 'accounts.get',
    description:
      'Read one account by its _id. Returns null when no account has that _id. Read-only.',
    kind: 'read',
    field: 'accountDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Account.nullable(),
  },
  {
    name: 'accounts.create',
    description:
      'Create an account in an existing category. code must be unique in the chart and must match the category mask when the category has one. kind is active or passive. journal defaults to main. Returns the new account.',
    kind: 'write',
    field: 'accountsAdd',
    args: {
      code: 'String',
      name: 'String',
      categoryId: 'String',
      currency: 'String',
      kind: 'String',
      journal: 'String',
      description: 'String',
    },
    input: z
      .object({
        code: z.string().min(1),
        name: z.string().optional(),
        categoryId: z.string().min(1),
        currency: z.string().optional(),
        kind: accountKind.optional(),
        journal: accountJournal.optional(),
        description: z.string().optional(),
      })
      .strict(),
    output: Account,
  },
  {
    name: 'accounts.edit',
    description:
      'Edit one account by its _id. code and categoryId are required on every edit, because the code is checked against the category mask. Omitted fields are left unchanged. Returns the updated account.',
    kind: 'write',
    field: 'accountsEdit',
    args: {
      _id: 'String!',
      code: 'String',
      name: 'String',
      categoryId: 'String',
      currency: 'String',
      kind: 'String',
      journal: 'String',
      description: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        code: z.string().min(1),
        name: z.string().optional(),
        categoryId: z.string().min(1),
        currency: z.string().optional(),
        kind: accountKind.optional(),
        journal: accountJournal.optional(),
        description: z.string().optional(),
      })
      .strict(),
    output: Account,
  },
  {
    name: 'accounts.remove',
    description:
      'Remove accounts by their _id. An account that a transaction already uses is marked deleted instead of erased. Destructive.',
    kind: 'destructive',
    field: 'accountsRemove',
    args: { accountIds: '[String!]!' },
    input: z
      .object({
        accountIds: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    output: z.string(),
  },
  {
    name: 'accountCategories.list',
    description:
      'Read account categories, ordered by their position in the category tree. parentId returns the direct children of that category. searchValue filters by name. Read-only.',
    kind: 'read',
    field: 'accountCategories',
    args: { parentId: 'String', searchValue: 'String' },
    input: z
      .object({
        parentId: z.string().optional(),
        searchValue: z.string().optional(),
      })
      .strict(),
    output: z.array(AccountCategory),
  },
  {
    name: 'accountCategories.count',
    description:
      'Count account categories matching the same filters as accountCategories.list. Read-only.',
    kind: 'read',
    field: 'accountCategoriesTotalCount',
    args: { parentId: 'String', searchValue: 'String' },
    input: z
      .object({
        parentId: z.string().optional(),
        searchValue: z.string().optional(),
      })
      .strict(),
    output: z.number(),
  },
  {
    name: 'accountCategories.get',
    description:
      'Read one account category by its _id. Returns null when no category has that _id. Read-only.',
    kind: 'read',
    field: 'accountCategoryDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: AccountCategory.nullable(),
  },
  {
    name: 'accountCategories.create',
    description:
      'Create an account category. code must be unique and cannot contain "/". parentId places the category under another one. Returns the new category.',
    kind: 'write',
    field: 'accountCategoriesAdd',
    args: {
      name: 'String!',
      code: 'String!',
      description: 'String',
      parentId: 'String',
    },
    input: z
      .object({
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        parentId: z.string().min(1).optional(),
      })
      .strict(),
    output: AccountCategory,
  },
  {
    name: 'accountCategories.edit',
    description:
      'Edit one account category by its _id. name and code are required on every edit, and the code must stay unique. Returns the updated category.',
    kind: 'write',
    field: 'accountCategoriesEdit',
    args: {
      _id: 'String!',
      name: 'String!',
      code: 'String!',
      description: 'String',
      parentId: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        parentId: z.string().min(1).optional(),
      })
      .strict(),
    output: AccountCategory,
  },
  {
    name: 'accountCategories.remove',
    description:
      'Remove one account category by its _id. Fails when the category still has accounts or child categories. Destructive.',
    kind: 'destructive',
    field: 'accountCategoriesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'transactions.list',
    description:
      'Read one page of journal transactions, newest ptrNumber first. Only journals the caller can read are returned. searchValue matches the description, number matches the entry number, accountIds keeps transactions that touch those accounts, and startDate and endDate are ISO dates. Pages are perPage rows (max 50). Use transactions.count for the total. Read-only.',
    kind: 'read',
    field: 'accTransactions',
    args: {
      searchValue: 'String',
      number: 'String',
      journal: 'String',
      accountIds: '[String]',
      startDate: 'Date',
      endDate: 'Date',
      page: 'Int',
      perPage: 'Int',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        number: z.string().optional(),
        journal: accountJournal.optional(),
        accountIds: z.array(z.string().min(1)).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        page: z.number().int().min(1).optional(),
        perPage: z.number().int().min(1).max(50).optional(),
      })
      .strict(),
    output: z.array(Transaction),
  },
  {
    name: 'transactions.count',
    description:
      'Count transactions matching the same filters as transactions.list. Read-only.',
    kind: 'read',
    field: 'accTransactionsCount',
    args: {
      searchValue: 'String',
      number: 'String',
      journal: 'String',
      accountIds: '[String]',
      startDate: 'Date',
      endDate: 'Date',
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        number: z.string().optional(),
        journal: accountJournal.optional(),
        accountIds: z.array(z.string().min(1)).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
      .strict(),
    output: z.number(),
  },
  {
    name: 'transactions.get',
    description:
      'Read one transaction by its _id. Returns null when no transaction has that _id. Read-only.',
    kind: 'read',
    field: 'accTransactionDetail',
    args: { _id: 'String!' },
    notFound: 'Transaction not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Transaction.nullable(),
  },
  {
    name: 'transactions.remove',
    description:
      'Remove one journal entry by its parentId, along with its related rows. Needs remove permission for the entry journals. Destructive.',
    kind: 'destructive',
    field: 'accTransactionsRemove',
    args: { parentId: 'String' },
    input: z.object({ parentId: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'vatRows.list',
    description:
      'Read VAT report rows, ordered by number. searchValue matches the row name or number. Deleted rows are left out. Read-only.',
    kind: 'read',
    field: 'vatRows',
    args: { searchValue: 'String' },
    input: z.object({ searchValue: z.string().optional() }).strict(),
    output: z.array(VatRow),
  },
  {
    name: 'vatRows.count',
    description:
      'Count VAT rows matching the same filters as vatRows.list. Read-only.',
    kind: 'read',
    field: 'vatRowsCount',
    args: { searchValue: 'String' },
    input: z.object({ searchValue: z.string().optional() }).strict(),
    output: z.number(),
  },
  {
    name: 'vatRows.get',
    description:
      'Read one VAT row by its _id. Returns null when no row has that _id. Read-only.',
    kind: 'read',
    field: 'vatRowDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: VatRow.nullable(),
  },
  {
    name: 'vatRows.create',
    description:
      'Create a VAT report row. kind is normal, formula, title, hidden or free. percent is the rate as a number. Returns the new row.',
    kind: 'write',
    field: 'vatRowsAdd',
    args: {
      name: 'String',
      number: 'String',
      kind: 'String',
      formula: 'String',
      formulaText: 'String',
      percent: 'Float',
    },
    input: z
      .object({
        name: z.string().optional(),
        number: z.string().optional(),
        kind: vatRowKind.optional(),
        formula: z.string().optional(),
        formulaText: z.string().optional(),
        percent: z.number().optional(),
      })
      .strict(),
    output: VatRow,
  },
  {
    name: 'vatRows.edit',
    description:
      'Edit one VAT row by its _id. Only the fields you pass change. Returns the updated row.',
    kind: 'write',
    field: 'vatRowsEdit',
    args: {
      _id: 'String!',
      name: 'String',
      number: 'String',
      kind: 'String',
      formula: 'String',
      formulaText: 'String',
      percent: 'Float',
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().optional(),
        number: z.string().optional(),
        kind: vatRowKind.optional(),
        formula: z.string().optional(),
        formulaText: z.string().optional(),
        percent: z.number().optional(),
      })
      .strict(),
    output: VatRow,
  },
  {
    name: 'vatRows.remove',
    description:
      'Remove VAT rows by their _id. A row that a transaction already uses is marked deleted instead of erased. Destructive.',
    kind: 'destructive',
    field: 'vatRowsRemove',
    args: { vatRowIds: '[String!]!' },
    input: z
      .object({
        vatRowIds: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    output: z.string(),
  },
  {
    name: 'ctaxRows.list',
    description:
      'Read corporate tax report rows, ordered by number. searchValue matches the row name or number. Deleted rows are left out. Read-only.',
    kind: 'read',
    field: 'ctaxRows',
    args: { searchValue: 'String' },
    input: z.object({ searchValue: z.string().optional() }).strict(),
    output: z.array(CtaxRow),
  },
  {
    name: 'ctaxRows.count',
    description:
      'Count corporate tax rows matching the same filters as ctaxRows.list. Read-only.',
    kind: 'read',
    field: 'ctaxRowsCount',
    args: { searchValue: 'String' },
    input: z.object({ searchValue: z.string().optional() }).strict(),
    output: z.number(),
  },
  {
    name: 'ctaxRows.get',
    description:
      'Read one corporate tax row by its _id. Returns null when no row has that _id. Read-only.',
    kind: 'read',
    field: 'ctaxRowDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: CtaxRow.nullable(),
  },
  {
    name: 'ctaxRows.create',
    description:
      'Create a corporate tax report row. kind is normal, formula, title or hidden. percent is the rate as a number. Returns the new row.',
    kind: 'write',
    field: 'ctaxRowsAdd',
    args: {
      name: 'String',
      number: 'String',
      kind: 'String',
      formula: 'String',
      formulaText: 'String',
      percent: 'Float',
    },
    input: z
      .object({
        name: z.string().optional(),
        number: z.string().optional(),
        kind: ctaxRowKind.optional(),
        formula: z.string().optional(),
        formulaText: z.string().optional(),
        percent: z.number().optional(),
      })
      .strict(),
    output: CtaxRow,
  },
  {
    name: 'ctaxRows.edit',
    description:
      'Edit one corporate tax row by its _id. Only the fields you pass change. Returns the updated row.',
    kind: 'write',
    field: 'ctaxRowsEdit',
    args: {
      _id: 'String!',
      name: 'String',
      number: 'String',
      kind: 'String',
      formula: 'String',
      formulaText: 'String',
      percent: 'Float',
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().optional(),
        number: z.string().optional(),
        kind: ctaxRowKind.optional(),
        formula: z.string().optional(),
        formulaText: z.string().optional(),
        percent: z.number().optional(),
      })
      .strict(),
    output: CtaxRow,
  },
  {
    name: 'ctaxRows.remove',
    description:
      'Remove corporate tax rows by their _id. A row that a transaction already uses is marked deleted instead of erased. Destructive.',
    kind: 'destructive',
    field: 'ctaxRowsRemove',
    args: { ctaxRowIds: '[String!]!' },
    input: z
      .object({
        ctaxRowIds: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    output: z.string(),
  },
  {
    name: 'fixedAssetCategories.list',
    description:
      'Read fixed asset categories. searchValue filters by code or name. Deleted categories are left out. Read-only.',
    kind: 'read',
    field: 'fixedAssetCategories',
    args: { searchValue: 'String' },
    input: z.object({ searchValue: z.string().optional() }).strict(),
    output: z.array(FixedAssetCategory),
  },
  {
    name: 'fixedAssetCategories.get',
    description:
      'Read one fixed asset category by its _id. Returns null when no category has that _id. Read-only.',
    kind: 'read',
    field: 'fixedAssetCategoryDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: FixedAssetCategory.nullable(),
  },
  {
    name: 'fixedAssetCategories.create',
    description:
      'Create a fixed asset category. code and name are required. parentId places it under another category. Returns the new category.',
    kind: 'write',
    field: 'fixedAssetCategoriesAdd',
    args: {
      code: 'String!',
      name: 'String!',
      description: 'String',
      parentId: 'String',
    },
    input: z
      .object({
        code: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        parentId: z.string().min(1).optional(),
      })
      .strict(),
    output: FixedAssetCategory,
  },
  {
    name: 'fixedAssetCategories.edit',
    description:
      'Edit one fixed asset category by its _id. code and name are required on every edit. Returns the updated category.',
    kind: 'write',
    field: 'fixedAssetCategoriesEdit',
    args: {
      _id: 'String!',
      code: 'String!',
      name: 'String!',
      description: 'String',
      parentId: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        code: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        parentId: z.string().min(1).optional(),
      })
      .strict(),
    output: FixedAssetCategory,
  },
  {
    name: 'fixedAssetCategories.remove',
    description:
      'Remove one fixed asset category by its _id. The category is marked deleted and drops out of lists. Destructive.',
    kind: 'destructive',
    field: 'fixedAssetCategoriesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'fixedAssets.list',
    description:
      'Read fixed assets, ordered by code. searchValue filters by code or name. categoryId filters by category. limit caps the rows returned (default 30, max 50). Deleted assets are left out. Read-only.',
    kind: 'read',
    field: 'fixedAssets',
    args: { searchValue: 'String', categoryId: 'String', limit: 'Int' },
    input: z
      .object({
        searchValue: z.string().optional(),
        categoryId: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
      })
      .strict(),
    output: z.array(FixedAsset),
  },
  {
    name: 'fixedAssets.get',
    description:
      'Read one fixed asset by its _id. Returns null when no fixed asset has that _id. Read-only.',
    kind: 'read',
    field: 'fixedAssetDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: FixedAsset.nullable(),
  },
  {
    name: 'fixedAssets.create',
    description:
      'Create a fixed asset in a category. code, name and categoryId are required. Depreciation settings are copied from the category. count and originalCost are numbers. acquisitionDate is an ISO date. Returns the new fixed asset.',
    kind: 'write',
    field: 'fixedAssetsAdd',
    args: {
      code: 'String!',
      name: 'String!',
      categoryId: 'String!',
      description: 'String',
      accountId: 'String',
      count: 'Float',
      originalCost: 'Float',
      acquisitionDate: 'Date',
    },
    input: z
      .object({
        code: z.string().min(1),
        name: z.string().min(1),
        categoryId: z.string().min(1),
        description: z.string().optional(),
        accountId: z.string().optional(),
        count: z.number().optional(),
        originalCost: z.number().optional(),
        acquisitionDate: z.string().optional(),
      })
      .strict(),
    output: FixedAsset,
  },
  {
    name: 'fixedAssets.edit',
    description:
      'Edit one fixed asset by its _id. code, name and categoryId are required on every edit. Omitted fields are left unchanged. Returns the updated fixed asset.',
    kind: 'write',
    field: 'fixedAssetsEdit',
    args: {
      _id: 'String!',
      code: 'String!',
      name: 'String!',
      categoryId: 'String!',
      description: 'String',
      accountId: 'String',
      count: 'Float',
      originalCost: 'Float',
      acquisitionDate: 'Date',
    },
    input: z
      .object({
        _id: z.string().min(1),
        code: z.string().min(1),
        name: z.string().min(1),
        categoryId: z.string().min(1),
        description: z.string().optional(),
        accountId: z.string().optional(),
        count: z.number().optional(),
        originalCost: z.number().optional(),
        acquisitionDate: z.string().optional(),
      })
      .strict(),
    output: FixedAsset,
  },
  {
    name: 'fixedAssets.remove',
    description:
      'Remove one fixed asset by its _id. The asset is marked deleted and drops out of lists. Destructive.',
    kind: 'destructive',
    field: 'fixedAssetsRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown(),
  },
]);
