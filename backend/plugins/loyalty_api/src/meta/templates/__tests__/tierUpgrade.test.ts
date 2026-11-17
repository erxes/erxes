import {
  materializeTemplate,
  validateTemplate,
} from 'erxes-api-shared/core-modules';
import { tierUpgradeTemplate } from '../tierUpgrade';

describe('tierUpgradeTemplate', () => {
  it('Is valid', () => {
    expect(validateTemplate(tierUpgradeTemplate)).toEqual([]);
  });

  it('Watches upward moves of the chosen wallet', () => {
    const [{ triggers, actions }] = materializeTemplate(tierUpgradeTemplate, {
      answers: {
        accountType: 'at1',
        sender: { value: 'hello@example.com', name: 'Us' },
      },
      partIds: {},
    }).automations;

    expect(triggers[0].config).toEqual({ accountTypeId: 'at1', direction: 'up' });
    expect(actions[0].config).toMatchObject({
      replyToEmail: 'hello@example.com',
      contentFormat: 'maily',
    });
  });
});
