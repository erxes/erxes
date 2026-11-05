import { posOrderCreateActionConfigSchema } from '../../../../pos/meta/automations/configSchemas';
import {
  checklistCreateActionConfigSchema,
  dealCreateActionConfigSchema,
} from '../configSchemas';

const issuePaths = (result: {
  error?: { issues: { path: PropertyKey[] }[] };
}) => (result.error?.issues || []).map(({ path }) => path.join('.'));

describe('sales action configs', () => {
  it('needs the stage of a deal, and a name', () => {
    expect(
      issuePaths(dealCreateActionConfigSchema.safeParse({ boardId: 'b1' })),
    ).toEqual(['stageId']);
    expect(
      dealCreateActionConfigSchema.safeParse({
        stageId: 's1',
        name: 'Deal for {{ trigger.firstName }}',
        assignedTo: 'u1',
      }).success,
    ).toBe(true);
  });

  it('needs a checklist name', () => {
    expect(
      issuePaths(checklistCreateActionConfigSchema.safeParse({ items: [] })),
    ).toEqual(['name']);
  });

  it('finds the POS by id or token, amounts may be placeholders', () => {
    expect(
      issuePaths(posOrderCreateActionConfigSchema.safeParse({ items: '[]' })),
    ).toEqual(['posId']);
    expect(
      posOrderCreateActionConfigSchema.safeParse({
        posToken: 't1',
        productIds: 'p1',
        count: '{{ trigger.count }}',
      }).success,
    ).toBe(true);
  });
});
