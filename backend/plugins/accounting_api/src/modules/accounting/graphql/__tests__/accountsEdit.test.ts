import type { IContext } from '~/connectionResolvers';
import type { IAccountsEdit } from '@/accounting/@types/account';
import { accountsMutations } from '../resolvers/mutations/accounts';

const doc: IAccountsEdit = {
  _id: 'account-1',
  code: '1000',
  name: 'Cash',
  currency: 'MNT',
  kind: 'active',
  journal: 'cash',
  status: 'active',
  isOutBalance: false,
};

const setup = () => {
  const checkPermission = jest.fn().mockResolvedValue(undefined);
  const getAccount = jest.fn().mockResolvedValue(doc);
  const updateAccount = jest.fn().mockResolvedValue(doc);
  const context = {
    checkPermission,
    models: { Accounts: { getAccount, updateAccount } },
  } as unknown as IContext;
  return { context, checkPermission, getAccount, updateAccount };
};

test('editing checks permission before accessing the account', async () => {
  const { context, checkPermission, getAccount, updateAccount } = setup();
  checkPermission.mockRejectedValue(new Error('Permission denied'));
  await expect(
    accountsMutations.accountsEdit(null, doc, context),
  ).rejects.toThrow('Permission denied');
  expect(getAccount).not.toHaveBeenCalled();
  expect(updateAccount).not.toHaveBeenCalled();
});

test.each(['', ' ', 'missing'])(
  'a missing account %p never reaches update',
  async (_id) => {
    const { context, getAccount, updateAccount } = setup();
    getAccount.mockRejectedValue(new Error('Account not found'));
    await expect(
      accountsMutations.accountsEdit(null, { ...doc, _id }, context),
    ).rejects.toThrow('Account not found');
    expect(getAccount).toHaveBeenCalledWith({ _id });
    expect(updateAccount).not.toHaveBeenCalled();
  },
);

test('editing passes the existing fields and status to the model', async () => {
  const { context, updateAccount } = setup();
  const { _id, ...fields } = doc;
  await expect(
    accountsMutations.accountsEdit(null, doc, context),
  ).resolves.toEqual(doc);
  expect(updateAccount).toHaveBeenCalledWith(_id, fields);
});
