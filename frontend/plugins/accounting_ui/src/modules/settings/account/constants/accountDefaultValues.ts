import { JournalEnum } from '../types/Account';
import { CurrencyCode } from 'erxes-ui';
import { AccountKind } from '../types/Account';
import { TAccountForm } from '../types/accountForm';

export const ACCOUNT_DEFAULT_VALUES: TAccountForm = {
  name: '',
  code: '',
  categoryId: '',
  description: '',
  currency: CurrencyCode.USD,
  kind: AccountKind.ACTIVE,
  journal: JournalEnum.MAIN,
  branchId: '',
  departmentId: '',
  isTemp: false,
  isOutBalance: false,
};
