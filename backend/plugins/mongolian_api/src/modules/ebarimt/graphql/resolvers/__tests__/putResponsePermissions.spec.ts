import { checkPermissionGroup } from 'erxes-api-shared/core-modules/permissions/utils';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { permissions } from '~/meta/permissions';
import { ebarimtMutations } from '@/ebarimt/graphql/resolvers/mutations/ebarimt';
import { putResponseQueries } from '@/ebarimt/graphql/resolvers/queries/ebarimt';

jest.mock('erxes-api-shared/utils', () => {
  class ExpectedError extends Error {
    constructor(
      message: string,
      readonly code: string,
    ) {
      super(message);
    }
  }

  return {
    ExpectedError,
    cursorPaginate: jest.fn(),
    escapeRegExp: (value: string) => value,
    getActivePlugins: jest.fn(async () => ['mongolian']),
    getPlugin: jest.fn(async () => ({ config: { meta: { permissions } } })),
    redis: { get: jest.fn(async () => null), set: jest.fn(), del: jest.fn() },
    sendTRPCMessage: jest.fn(),
  };
});
jest.mock('~/modules/ebarimt/utils', () => ({
  getCompanyInfo: jest.fn(),
  returnResponse: jest.fn(),
}));
jest.mock('~/modules/ebarimt/getPutResponseDetail', () => ({
  getPutResponseDetail: jest.fn(),
}));

const page = {
  list: [{ _id: 'pr-0357', number: '20261111/0357', status: 'SUCCESS' }],
  pageInfo: { hasNextPage: false },
  totalCount: 1,
};

const findOne = jest.fn(() => ({ lean: async () => null }));

const contextFor = (user?: Partial<IUserDocument>) =>
  ({
    subdomain: 'priuscenter',
    models: { PutResponses: { findOne } },
    checkPermission: checkPermissionGroup(
      'priuscenter',
      user as IUserDocument | undefined,
    ),
  }) as unknown as IContext;

const listPutResponses = (context: IContext) =>
  putResponseQueries.putResponses(undefined, {}, context);

describe('put response permissions', () => {
  beforeEach(() => {
    jest.mocked(cursorPaginate).mockReset().mockResolvedValue(page as never);
    findOne.mockClear();
  });

  it('lets a Mongolian Admin open the put response list', async () => {
    const context = contextFor({
      _id: 'user-admin',
      permissionGroupIds: ['mongolian:admin'],
    });

    await expect(listPutResponses(context)).resolves.toEqual(page);
  });

  it('lets a Mongolian Admin reach the bill return', async () => {
    const context = contextFor({
      _id: 'user-admin',
      permissionGroupIds: ['mongolian:admin'],
    });

    await expect(
      ebarimtMutations.putResponseReturnBill(
        undefined,
        { _id: 'pr-missing' },
        context,
      ),
    ).rejects.toThrow('not found putResponse');
    expect(findOne).toHaveBeenCalledWith({ _id: 'pr-missing' });
  });

  it('lets a Mongolian User read the list but not return a bill', async () => {
    const context = contextFor({
      _id: 'user-cashier',
      permissionGroupIds: ['mongolian:user'],
    });

    await expect(listPutResponses(context)).resolves.toEqual(page);
    await expect(
      ebarimtMutations.putResponseReturnBill(
        undefined,
        { _id: 'pr-0357' },
        context,
      ),
    ).rejects.toThrow('Permission required');
    expect(findOne).not.toHaveBeenCalled();
  });

  it('honors a custom permission granted directly on the user', async () => {
    const context = contextFor({
      _id: 'user-accountant',
      customPermissions: [
        { plugin: 'mongolian', module: 'ebarimt', actions: ['putResponses'] },
      ],
    } as Partial<IUserDocument>);

    await expect(listPutResponses(context)).resolves.toEqual(page);
  });

  it('hides the list from a user without any Mongolian group', async () => {
    const context = contextFor({ _id: 'user-sales', permissionGroupIds: [] });

    await expect(listPutResponses(context)).rejects.toThrow(
      'Permission required',
    );
    expect(cursorPaginate).not.toHaveBeenCalled();
  });

  it('asks a signed-out visitor to log in', async () => {
    await expect(listPutResponses(contextFor(undefined))).rejects.toThrow(
      'Login required',
    );
  });
});
