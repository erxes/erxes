import { TAutomationFindObjectType } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { findObject } from '../findObject';
import { SECRET_USER_FIELDS_PROJECTION } from '~/modules/organization/team-member/loggedUser';

describe('find object: team member', () => {
  it('reads the user without credentials', async () => {
    const lean = jest.fn().mockResolvedValue({ _id: 'u1', email: 'a@b.mn' });
    const findOne = jest.fn().mockReturnValue({ lean });
    const models = { Users: { findOne } } as unknown as IModels;

    const result = await findObject(models, {
      objectType: TAutomationFindObjectType.USER,
      field: 'email',
      value: 'a@b.mn',
    });

    expect(findOne).toHaveBeenCalledWith(
      expect.any(Object),
      SECRET_USER_FIELDS_PROJECTION,
      undefined,
    );
    expect(result.found).toBe(true);
  });

  it('reads the newest record when asked', async () => {
    const lean = jest.fn().mockResolvedValue({ _id: 'c1' });
    const findOne = jest.fn().mockReturnValue({ lean });
    const models = { Customers: { findOne } } as unknown as IModels;

    await findObject(models, {
      objectType: TAutomationFindObjectType.CUSTOMER,
      field: '_id',
      value: 'c1',
      newest: true,
    });

    expect(findOne).toHaveBeenCalledWith(expect.any(Object), undefined, {
      sort: { createdAt: -1 },
    });
  });
});
