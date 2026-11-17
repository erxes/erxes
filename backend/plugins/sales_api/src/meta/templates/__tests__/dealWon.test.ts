import {
  materializeTemplate,
  templateGroupOf,
} from 'erxes-api-shared/core-modules';
import { dealWonTemplate } from '../dealWon';

describe('dealWonTemplate', () => {
  it('Is a single-journey automation, won in any pipeline', () => {
    expect(templateGroupOf(dealWonTemplate)).toBe('automation');
    expect(dealWonTemplate.journeys[0].trigger).toEqual({
      type: 'sales:sales.deals.probability',
      config: { probability: 'Won' },
    });
  });

  it('Writes the team and sender into the one step each belongs to', () => {
    const { automations } = materializeTemplate(dealWonTemplate, {
      answers: {
        team: '[[ user.u1 ]]',
        sender: { value: 'hello@example.com', name: 'Support' },
      },
      partIds: {},
    });

    const [{ actions }] = automations;
    const notify = actions.find((action) => action.type === 'sendNotification');
    const email = actions.find((action) => action.type === 'sendEmail');

    expect(notify?.config).toMatchObject({ userIds: '[[ user.u1 ]]' });
    expect(email?.config).toMatchObject({
      replyToEmail: 'hello@example.com',
      sender: 'Support',
      toEmailsPlaceHolders: '{{ trigger.customers.primaryEmail }}',
    });
  });

  // The org only picks a sender; the wording is the template's own draft,
  // reworded in the builder after installing, never in the wizard.
  it('Starts the thank-you email with its own text, unasked', () => {
    const [sendEmail] = dealWonTemplate.journeys[0].flow.filter(
      (step) => step.type === 'sendEmail',
    );

    expect(dealWonTemplate.requirements.map(({ kind }) => kind)).not.toContain(
      'core:emails.content',
    );
    expect(sendEmail.config).toMatchObject({
      subject: 'Thank you for your business',
    });
    expect(sendEmail.config?.content).toContain('{{ trigger.customers.firstName }}');
    // Without its source the email editor opens empty
    expect(sendEmail.config?.contentFormat).toBe('maily');
    expect(JSON.stringify(sendEmail.config?.contentJson)).toContain('{{ trigger.customers.firstName }}');
  });
});
