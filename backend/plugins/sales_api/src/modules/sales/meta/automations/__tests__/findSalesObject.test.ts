import { IModels } from '~/connectionResolvers';
import { findSalesObject } from '../findObject';

const modelsWith = (doc: Record<string, unknown> | null) => {
  const lean = jest.fn().mockResolvedValue(doc);
  const findOne = jest.fn().mockReturnValue({ lean });

  return {
    findOne,
    models: {
      PosOrders: { findOne },
      Deals: { findOne },
    } as unknown as IModels,
  };
};

describe('findSalesObject: POS order', () => {
  it('finds an order by number', async () => {
    const { models, findOne } = modelsWith({ _id: 'o1', number: '1042' });

    const result = await findSalesObject(models, {
      objectType: 'sales:pos.orders',
      field: 'number',
      value: '1042',
    });

    expect(findOne).toHaveBeenCalledWith(
      { number: '1042' },
      undefined,
      undefined,
    );
    expect(result).toMatchObject({ found: true, objectId: 'o1' });
  });

  it("reads a customer's newest order, never a company's", async () => {
    const { models, findOne } = modelsWith(null);

    const result = await findSalesObject(models, {
      objectType: 'sales:pos.orders',
      field: 'customerId',
      value: 'c-102',
      newest: true,
    });

    expect(findOne).toHaveBeenCalledWith(
      { customerId: 'c-102', customerType: { $in: [null, '', 'customer'] } },
      undefined,
      { sort: { createdAt: -1 } },
    );
    expect(result.found).toBe(false);
  });

  it('refuses a field the target does not offer', async () => {
    const { models } = modelsWith(null);

    await expect(
      findSalesObject(models, {
        objectType: 'sales:pos.orders',
        field: 'name',
        value: 'x',
      }),
    ).rejects.toThrow('Unsupported lookup field "name" for "POS order"');
  });
});
