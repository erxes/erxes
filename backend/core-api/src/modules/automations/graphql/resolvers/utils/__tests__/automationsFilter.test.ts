import { IListArgs } from '@/automations/graphql/resolvers/queries';
import { generateAutomationsFilter } from '@/automations/graphql/resolvers/utils/queriesUtils';

const filterOf = (params: Partial<IListArgs>) =>
  generateAutomationsFilter(params as IListArgs);

describe('generateAutomationsFilter folders', () => {
  it('Shows only what a folder holds inside it', () => {
    expect(filterOf({ folderId: 'f1', withoutFolder: true }).folderId).toBe(
      'f1',
    );
  });

  it('Shows only what no folder holds at the top', () => {
    expect(filterOf({ withoutFolder: true }).folderId).toEqual({
      $in: [null, ''],
    });
  });

  it('Looks through every folder otherwise', () => {
    expect(filterOf({ searchValue: 'sales' })).not.toHaveProperty('folderId');
  });
});
