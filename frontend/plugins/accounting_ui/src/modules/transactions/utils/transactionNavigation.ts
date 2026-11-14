import { AccountingPath } from '@/types/AccountingPath';

type TransactionReturnLocation = {
  pathname: string;
  search: string;
};

export const getCurrentTransactionReturnPath = ({
  pathname,
  search,
}: TransactionReturnLocation) => `${pathname}${search}`;

const TRANSACTION_RETURN_PATHS = new Set<string>([
  AccountingPath.Main,
  AccountingPath.Records,
]);

const ACCOUNTING_ROOT_PATHS = new Set<string>(['/accounting', '/accounting/']);

export const getTransactionReturnPath = (returnTo?: string | null) => {
  if (!returnTo) {
    return AccountingPath.Main;
  }

  const queryIndex = returnTo.indexOf('?');
  const pathname = queryIndex === -1 ? returnTo : returnTo.slice(0, queryIndex);
  const search = queryIndex === -1 ? '' : returnTo.slice(queryIndex);
  const listPath = ACCOUNTING_ROOT_PATHS.has(pathname)
    ? AccountingPath.Main
    : pathname;

  if (!TRANSACTION_RETURN_PATHS.has(listPath)) {
    return AccountingPath.Main;
  }

  return `${listPath}${search}`;
};

export const buildTransactionCreatePath = ({
  defaultJournal,
  returnTo,
}: {
  defaultJournal: string;
  returnTo?: string | null;
}) => {
  const params = new URLSearchParams({ defaultJournal });

  if (returnTo) {
    params.set('returnTo', getTransactionReturnPath(returnTo));
  }

  return `${AccountingPath.TransactionCreate}?${params.toString()}`;
};

export const buildTransactionEditPath = ({
  parentId,
  trId,
  returnTo,
}: {
  parentId?: string | null;
  trId?: string | null;
  returnTo?: string | null;
}) => {
  const params = new URLSearchParams();

  if (parentId) {
    params.set('parentId', parentId);
  }

  if (trId) {
    params.set('trId', trId);
  }

  if (returnTo) {
    params.set('returnTo', getTransactionReturnPath(returnTo));
  }

  return `${AccountingPath.TransactionEdit}?${params.toString()}`;
};
