import type { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { connection } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import type { ITransaction } from '../../../@types/transaction';
import { loadTransactionClass } from '../Transactions';
import type { ITransactionModel } from '../Transactions';
import * as saveUtils from '../../../utils/commonSave';
import * as removeUtils from '../../../utils/commonRemove';

const rows: ITransaction[] = [
  {
    _id: 'retained',
    date: new Date('2026-01-01'),
    journal: 'main',
    parentId: 'parent',
    ptrId: 'ptr',
    ptrNumber: '1',
    details: [],
  },
  {
    _id: 'removed',
    date: new Date('2026-01-01'),
    journal: 'fxaIncome',
    parentId: 'parent',
    ptrId: 'ptr',
    ptrNumber: '1',
    details: [],
  },
];
const query = (value: unknown) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const setup = () => {
  const find = jest.fn(() => query(rows));
  const deleteMany = jest.fn();
  const models = { Transactions: { find, deleteMany } } as unknown as IModels;
  const events = {
    sendDbEventLog: jest.fn(),
    createActivityLog: jest.fn(),
  } as unknown as EventDispatcherReturn;
  const schema = loadTransactionClass(models, 'tenant', events);
  const methods = schema.statics as unknown as Pick<
    ITransactionModel,
    'createPTransaction' | 'updatePTransaction' | 'removePTransaction'
  >;
  return { models, methods, find, deleteMany };
};

describe('transaction model validation phases', () => {
  afterEach(() => jest.restoreAllMocks());

  const spies = () => ({
    session: jest
      .spyOn(connection, 'startSession')
      .mockRejectedValue(new Error('Unexpected session')),
    save: jest
      .spyOn(saveUtils, 'commonSave')
      .mockRejectedValue(new Error('Unexpected save')),
    remove: jest
      .spyOn(removeUtils, 'commonRemove')
      .mockRejectedValue(new Error('Unexpected cleanup')),
    saveValidation: jest
      .spyOn(saveUtils, 'commonSaveValidation')
      .mockResolvedValue(undefined),
    removeValidation: jest
      .spyOn(removeUtils, 'commonRemoveValidation')
      .mockResolvedValue(undefined),
  });

  it('finishes create validation before starting any save', async () => {
    const { methods } = setup();
    const calls = spies();
    calls.saveValidation
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Blocked validation'));
    await expect(
      methods.createPTransaction(rows, 'user', {
        skipAccountPermission: true,
      }),
    ).rejects.toThrow('Blocked validation');
    expect(calls.saveValidation).toHaveBeenCalledTimes(2);
    expect(calls.save).not.toHaveBeenCalled();
    expect(calls.session).not.toHaveBeenCalled();
  });

  it('validates edited rows and removed rows before updating a group', async () => {
    const { methods, deleteMany } = setup();
    const calls = spies();
    calls.removeValidation.mockRejectedValue(new Error('Blocked validation'));
    await expect(
      methods.updatePTransaction('parent', [rows[0]], 'user', {
        skipAccountPermission: true,
      }),
    ).rejects.toThrow('Blocked validation');
    expect(calls.saveValidation).toHaveBeenCalledTimes(1);
    expect(calls.removeValidation).toHaveBeenCalledTimes(1);
    expect(calls.save).not.toHaveBeenCalled();
    expect(calls.remove).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
    expect(calls.session).not.toHaveBeenCalled();
  });

  it('finishes every removal validation before any group cleanup', async () => {
    const { methods, find, deleteMany } = setup();
    find
      .mockReturnValueOnce(query(rows))
      .mockReturnValueOnce(query(rows))
      .mockReturnValueOnce(query([]))
      .mockReturnValueOnce(query(rows));
    const calls = spies();
    calls.removeValidation
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Blocked validation'));
    await expect(
      methods.removePTransaction({ parentId: 'parent' }),
    ).rejects.toThrow('Blocked validation');
    expect(calls.removeValidation).toHaveBeenCalledTimes(2);
    expect(calls.remove).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
