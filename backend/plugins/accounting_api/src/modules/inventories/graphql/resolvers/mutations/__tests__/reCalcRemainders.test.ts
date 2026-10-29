import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { remainderMutations } from '../remainders';
import { updateLiveRemainders } from '../utils';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('../utils', () => ({ updateLiveRemainders: jest.fn() }));

const send = jest.mocked(sendTRPCMessage);
const recalculate = jest.mocked(updateLiveRemainders);
const context = {
  subdomain: 'tenant',
  models: {},
  user: { _id: 'user' },
} as unknown as IContext;
const locations = () =>
  recalculate.mock.calls.map(([params]) => [
    params.branchId,
    params.departmentId,
  ]);

beforeEach(() => {
  jest.clearAllMocks();
  send.mockImplementation(async ({ module }) =>
    module === 'branches'
      ? [{ _id: 'branch-a' }, { _id: 'branch-b' }]
      : [{ _id: 'dept-a' }, { _id: 'dept-b' }],
  );
  recalculate.mockResolvedValue(undefined);
});

describe('reCalcRemainders location scopes', () => {
  it('recalculates every branch/department pair, including unassigned, for blank filters', async () => {
    await remainderMutations.reCalcRemainders(
      null,
      { branchId: '', departmentId: '' },
      context,
    );
    expect(locations()).toEqual([
      ['_', '_'],
      ['_', 'dept-a'],
      ['_', 'dept-b'],
      ['branch-a', '_'],
      ['branch-a', 'dept-a'],
      ['branch-a', 'dept-b'],
      ['branch-b', '_'],
      ['branch-b', 'dept-a'],
      ['branch-b', 'dept-b'],
    ]);
  });

  it('only expands the blank dimension when branch is explicitly unassigned', async () => {
    await remainderMutations.reCalcRemainders(null, { branchId: '_' }, context);
    expect(locations()).toEqual([
      ['_', '_'],
      ['_', 'dept-a'],
      ['_', 'dept-b'],
    ]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ subdomain: 'tenant', module: 'departments' }),
    );
  });

  it('only expands the blank dimension when department is explicitly unassigned', async () => {
    await remainderMutations.reCalcRemainders(
      null,
      { departmentId: '_' },
      context,
    );
    expect(locations()).toEqual([
      ['_', '_'],
      ['branch-a', '_'],
      ['branch-b', '_'],
    ]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ module: 'branches' }),
    );
  });

  it('keeps explicit ids, underscores, selected products and category unchanged', async () => {
    await remainderMutations.reCalcRemainders(
      null,
      {
        branchId: 'branch-a',
        departmentId: '_',
        productIds: ['product'],
        productCategoryId: 'category',
      },
      context,
    );
    expect(send).not.toHaveBeenCalled();
    expect(recalculate).toHaveBeenCalledTimes(1);
    expect(recalculate).toHaveBeenCalledWith({
      subdomain: 'tenant',
      models: context.models,
      branchId: 'branch-a',
      departmentId: '_',
      productIds: ['product'],
      productCategoryId: 'category',
    });
  });

  it('keeps two unassigned options separate from an unfiltered recalculation', async () => {
    await remainderMutations.reCalcRemainders(
      null,
      { branchId: '_', departmentId: '_' },
      context,
    );
    expect(locations()).toEqual([['_', '_']]);
    expect(send).not.toHaveBeenCalled();
  });

  it('requires authentication before recalculating balances', async () => {
    await expect(
      remainderMutations.reCalcRemainders(null, {}, {
        ...context,
        user: undefined,
      } as unknown as IContext),
    ).rejects.toThrow('Login required');
    expect(send).not.toHaveBeenCalled();
    expect(recalculate).not.toHaveBeenCalled();
  });
});
