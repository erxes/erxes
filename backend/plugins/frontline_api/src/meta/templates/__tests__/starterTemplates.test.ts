import {
  materializeTemplate,
  templateGroupOf,
  validateTemplate,
} from 'erxes-api-shared/core-modules';
import { slaBreachTemplate } from '../slaBreach';
import { ticketResolvedRatingTemplate } from '../ticketResolvedRating';
import { urgentTicketTemplate } from '../urgentTicket';

describe('frontline starter templates', () => {
  it.each([slaBreachTemplate, urgentTicketTemplate, ticketResolvedRatingTemplate])(
    '$id is valid',
    (template) => {
      expect(validateTemplate(template)).toEqual([]);
    },
  );

  it('Escalates breaches only, not warnings', () => {
    expect(slaBreachTemplate.journeys[0].trigger.config).toEqual({
      events: ['firstResponse.breached', 'resolution.breached'],
    });
  });

  it('Alerts on high and critical tickets through its own segment', () => {
    const { automations, parts } = materializeTemplate(urgentTicketTemplate, {
      answers: { team: '[[ user.u1 ]]' },
      partIds: { urgent: 's1' },
    });

    expect(automations[0].triggers[0].config).toEqual({ contentId: 's1' });
    expect(parts[0].doc.root.children[0]).toMatchObject({
      fieldKey: 'priority',
      operator: 'numberigt',
      value: 3,
    });
  });

  it('Rating template also alerts on a 1 or 2 from its own form', () => {
    expect(templateGroupOf(ticketResolvedRatingTemplate)).toBe('solution');

    const low = materializeTemplate(ticketResolvedRatingTemplate, {
      answers: {
        destination: { pipelineId: 'p1', status: 'st1' },
        sender: { value: 'hello@example.com', name: 'Support' },
        team: '[[ user.u1 ]]',
      },
      partIds: { rating: 'f1' },
      partRefs: { rating: { formId: 'f1', ratingFieldId: 'fld1' } },
    }).automations.find(({ journey }) => journey === 'low');

    expect(low?.triggers[0].config).toMatchObject({
      formId: 'f1',
      conditions: [
        { fieldId: 'fld1', value: '1' },
        { fieldId: 'fld1', value: '2' },
      ],
    });
    expect(low?.actions[0].config).toMatchObject({ userIds: '[[ user.u1 ]]' });
  });
});
