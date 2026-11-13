import { IModels } from '~/connectionResolvers';
import { toProductStockView } from '../productStock';

const modelsWithBranches = (branches: { _id: string; title: string }[]) =>
  ({
    Branches: {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(branches),
      }),
    },
  } as unknown as IModels);

describe('toProductStockView', () => {
  it('sums stock per branch by name and never shows cost', async () => {
    const view = await toProductStockView(
      modelsWithBranches([{ _id: 'b1', title: 'Хан-Уул' }]),
      {
        _id: 'p1',
        name: 'Latte',
        code: 'LT-01',
        unitPrice: 7500,
        inventories: {
          b1: { d1: { remainder: 4 }, d2: { remainder: 2 } },
          _: { _: { remainder: 1 } },
        },
      },
    );

    expect(view).toMatchObject({
      code: 'LT-01',
      stockTracked: true,
      remainder: 7,
      branches: [{ name: 'Хан-Уул', remainder: 6 }],
    });
    expect(JSON.stringify(view)).not.toContain('cost');
  });

  it('tells untracked stock apart from sold out', async () => {
    const view = await toProductStockView(modelsWithBranches([]), {
      _id: 'p2',
      code: 'X',
    });

    expect(view).toMatchObject({ stockTracked: false, remainder: 0 });
  });
});
