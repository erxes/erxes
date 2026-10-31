/**
 * The support guard: a support user never passes the actions that would let a
 * visit outlast its grant, whatever its permission groups say.
 */
jest.mock('erxes-api-shared/utils', () =>
  jest.requireActual('erxes-api-shared/utils/errorClassifier'),
);

import type { IUserDocument } from 'erxes-api-shared/core-types';
import {
  DENIED_DURING_SUPPORT,
  guardSupportPermissions,
} from '@/auth/supportAccess/guard';
import type { IModels } from '~/connectionResolvers';

const setup = (isSupportUser: boolean) => {
  const isSupport = jest.fn().mockResolvedValue(isSupportUser);
  const checkPermission = jest.fn().mockResolvedValue(undefined);
  const models = { Users: { isSupportUser: isSupport } } as never as IModels;
  const guarded = guardSupportPermissions(
    models,
    { _id: 'u1' } as IUserDocument,
    checkPermission,
  );

  return { guarded, isSupport, checkPermission };
};

describe('support users', () => {
  it.each([...DENIED_DURING_SUPPORT])('cannot %s', async (action) => {
    const { guarded, checkPermission } = setup(true);

    await expect(guarded(action)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(checkPermission).not.toHaveBeenCalled();
  });

  it('keep what their groups allow otherwise', async () => {
    const { guarded, checkPermission } = setup(true);

    await guarded('brandsCreate');

    expect(checkPermission).toHaveBeenCalledWith('brandsCreate', undefined);
  });
});

describe('everyone else', () => {
  it('goes through the normal check for a denied action', async () => {
    const { guarded, checkPermission } = setup(false);

    await guarded('teamMembersInvite');
    await guarded('teamMembersUpdate', 'u2');

    expect(checkPermission).toHaveBeenCalledWith('teamMembersInvite', undefined);
    expect(checkPermission).toHaveBeenCalledWith('teamMembersUpdate', 'u2');
  });

  it('costs no lookup for actions that are never denied', async () => {
    const { guarded, isSupport } = setup(false);

    await guarded('brandsCreate');
    await guarded('showAgents');

    expect(isSupport).not.toHaveBeenCalled();
  });

  it('looks up support once per request', async () => {
    const { guarded, isSupport } = setup(false);

    await guarded('teamMembersInvite');
    await guarded('permissionsManage');

    expect(isSupport).toHaveBeenCalledTimes(1);
  });
});
