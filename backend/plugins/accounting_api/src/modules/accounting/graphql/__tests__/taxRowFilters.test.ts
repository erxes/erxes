import type { IContext } from '~/connectionResolvers';
import { vatRowQueries } from '../resolvers/queries/vatRows';
import { ctaxRowQueries } from '../resolvers/queries/ctaxRows';
import { escapeRegExp } from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: jest.fn(() => '\\.\\['),
}));

test.each([
  ['VAT', vatRowQueries.vatRowsCount],
  ['CTAX', ctaxRowQueries.ctaxRowsCount],
] as const)(
  '%s search preserves the combined name/number conditions with a literal regex',
  async (_name, query) => {
    const find = jest.fn(() => ({
      countDocuments: jest.fn().mockResolvedValue(0),
    }));
    const context = {
      checkPermission: jest.fn().mockResolvedValue(undefined),
      models: { VatRows: { find }, CtaxRows: { find } },
    } as unknown as IContext;
    await query(
      null,
      { kinds: undefined, status: undefined, searchValue: '.[' },
      context,
    );
    expect(escapeRegExp).toHaveBeenCalledWith('.[');
    expect(find).toHaveBeenCalledWith({
      status: expect.objectContaining({ $nin: expect.any(Array) }),
      name: /\.\[/i,
      number: /\.\[/i,
    });
  },
);
