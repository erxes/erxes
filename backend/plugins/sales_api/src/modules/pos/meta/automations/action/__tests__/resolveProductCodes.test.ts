import { resolveItemProductCodes } from '../resolveProductCodes';

const findByCodes = jest.fn(async (codes: string[]) =>
  codes
    .filter((code) => code !== 'GHOST')
    .map((code) => ({ _id: `id-${code}`, code })),
);

describe('resolveItemProductCodes', () => {
  beforeEach(() => findByCodes.mockClear());

  it('turns codes into product ids and keeps lines that already have one', async () => {
    const items = await resolveItemProductCodes(
      JSON.stringify([
        { code: 'A1', count: 2 },
        { productId: 'p-9', count: 1 },
        { code: 'A1', count: 1 },
      ]),
      findByCodes,
    );

    expect(items).toEqual([
      { code: 'A1', count: 2, productId: 'id-A1' },
      { productId: 'p-9', count: 1 },
      { code: 'A1', count: 1, productId: 'id-A1' },
    ]);
    expect(findByCodes).toHaveBeenCalledWith(['A1']);
  });

  it('fails on a code no product has', async () => {
    await expect(
      resolveItemProductCodes([{ code: 'GHOST' }], findByCodes),
    ).rejects.toThrow('No product with code: GHOST');
  });

  it('leaves items without codes untouched and asks nothing', async () => {
    const raw = '[{"productId":"p-1"}]';

    await expect(resolveItemProductCodes(raw, findByCodes)).resolves.toBe(raw);
    await expect(resolveItemProductCodes('', findByCodes)).resolves.toBe('');
    expect(findByCodes).not.toHaveBeenCalled();
  });
});
