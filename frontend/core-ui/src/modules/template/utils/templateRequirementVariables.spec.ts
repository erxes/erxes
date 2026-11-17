import { AutomationNodeType } from '@/automations/types';
import { templateRequirementSourceNodes } from '@/template/utils/templateRequirementVariables';

const template = {
  journeys: [
    {
      key: 'won',
      name: 'Deal won',
      triggerType: 'sales:sales.deals.probability',
    },
  ],
};

describe('templateRequirementSourceNodes', () => {
  it("Offers the journey's trigger a step/trigger/workflow fill names", () => {
    expect(
      templateRequirementSourceNodes(template, {
        fills: [{ journey: 'won' }],
      }),
    ).toEqual([
      {
        id: 'trigger',
        type: 'sales:sales.deals.probability',
        nodeType: AutomationNodeType.Trigger,
        label: 'Deal won',
      },
    ]);
  });

  it('Offers nothing for a requirement with no fills, or a part-only one', () => {
    expect(templateRequirementSourceNodes(template, {})).toEqual([]);
    expect(templateRequirementSourceNodes(template, { fills: [{}] })).toEqual(
      [],
    );
  });

  it('Stays empty while the template has not loaded yet', () => {
    expect(
      templateRequirementSourceNodes(undefined, {
        fills: [{ journey: 'won' }],
      }),
    ).toEqual([]);
  });
});
