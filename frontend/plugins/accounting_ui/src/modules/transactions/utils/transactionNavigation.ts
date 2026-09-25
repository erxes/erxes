import { AccountingPath } from '@/types/AccountingPath';

type TransactionReturnLocation = {
  pathname: string;
  search: string;
};

export const getCurrentTransactionReturnPath = ({
  pathname,
  search,
}: TransactionReturnLocation) => `${pathname}${search}`;

export const getTransactionReturnPath = (returnTo?: string | null) => {
  if (returnTo?.split('?')[0] !== AccountingPath.Main) {
    return AccountingPath.Main;
  }

  return returnTo;
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
