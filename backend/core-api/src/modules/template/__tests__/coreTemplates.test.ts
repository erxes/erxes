import {
  materializeTemplate,
  validateTemplate,
} from 'erxes-api-shared/core-modules';
import { CORE_TEMPLATES } from '@/template/builtIn';
import { birthdayGreetingTemplate } from '@/template/builtIn/birthdayGreeting';
import { welcomeSeriesTemplate } from '@/template/builtIn/welcomeSeries';
import {
  startMembershipTriggerAtJoined,
  templatePartKeysWatchedByMembership,
} from '@/template/db/utils';

describe('core templates', () => {
  it.each(CORE_TEMPLATES)('$id is valid', (template) => {
    expect(validateTemplate(template)).toEqual([]);
  });

  it('Lists a segment only a membership trigger can watch', () => {
    expect(templatePartKeysWatchedByMembership(birthdayGreetingTemplate)).toEqual(
      new Set(['today']),
    );
    // A plain segment trigger evaluates its segment directly
    expect(templatePartKeysWatchedByMembership(welcomeSeriesTemplate).size).toBe(
      0,
    );
  });

  it('Starts a membership trigger from its joined exit', () => {
    const [{ triggers, actions }] = materializeTemplate(
      birthdayGreetingTemplate,
      {
        answers: { sender: { value: 'hello@example.com', name: 'Us' } },
        partIds: { today: 'seg1' },
      },
    ).automations;
    const trigger = startMembershipTriggerAtJoined(triggers[0]);

    expect(trigger.actionId).toBe('');
    expect(trigger.config).toEqual({
      event: 'segmentMembership',
      segmentId: 'seg1',
      joined: actions[0].id,
    });
  });

  it('Leaves a plain trigger as it is', () => {
    const trigger = { actionId: 'a1', config: { contentId: 's1' } };

    expect(startMembershipTriggerAtJoined(trigger)).toBe(trigger);
  });

  it('Sends the welcome emails from the one chosen sender', () => {
    const [{ actions }] = materializeTemplate(welcomeSeriesTemplate, {
      answers: { sender: { value: 'hello@example.com', name: 'Us' } },
      partIds: { new: 's1' },
    }).automations;
    const emails = actions.filter(({ type }) => type === 'sendEmail');

    expect(emails).toHaveLength(3);
    for (const { config } of emails) {
      expect(config).toMatchObject({
        replyToEmail: 'hello@example.com',
        sender: 'Us',
        contentFormat: 'maily',
      });
    }
  });
});
