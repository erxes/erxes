import {
  materializeTemplate,
  templateGroupOf,
} from 'erxes-api-shared/core-modules';
import { ticketResolvedRatingTemplate } from '../ticketResolvedRating';

describe('ticketResolvedRatingTemplate', () => {
  it('Asks for a rating and alerts on a low one, watching an existing pipeline', () => {
    expect(templateGroupOf(ticketResolvedRatingTemplate)).toBe('solution');
    expect(ticketResolvedRatingTemplate.journeys[0].trigger.type).toBe(
      'frontline:tickets.tickets.statusChanged',
    );
  });

  it('Writes the chosen status and sender into the trigger and step', () => {
    const { automations } = materializeTemplate(ticketResolvedRatingTemplate, {
      answers: {
        destination: { channelId: 'c1', pipelineId: 'p1', status: 's1' },
        sender: { value: 'hello@example.com', name: 'Support' },
      },
      partIds: { rating: 'form-1' },
      partRefs: { rating: { formId: 'form-1' } },
    });

    const [{ triggers, actions }] = automations;

    expect(triggers[0].config).toMatchObject({
      pipelineId: 'p1',
      toStatusIds: 's1',
    });
    const formLink = actions.find(
      (action) => action.type === 'frontline:form.links.create',
    );
    const email = actions.find((action) => action.type === 'sendEmail');

    expect(formLink?.config).toMatchObject({ formId: 'form-1' });
    expect(email?.config).toMatchObject({
      replyToEmail: 'hello@example.com',
      sender: 'Support',
      toEmailsPlaceHolders: '{{ trigger.customerId.primaryEmail }}',
    });
  });

  // The org only picks a status and a sender; the wording is the template's
  // own draft, reworded in the builder after installing, never in the wizard.
  it('Starts the email with its own text, unasked', () => {
    const [sendEmail] = ticketResolvedRatingTemplate.journeys[0].flow.filter(
      (step) => step.type === 'sendEmail',
    );

    expect(
      ticketResolvedRatingTemplate.requirements.map(({ kind }) => kind),
    ).not.toContain('core:emails.content');
    expect(sendEmail.config).toMatchObject({
      subject: 'Your ticket #{{ trigger.number }} is resolved',
    });
    expect(sendEmail.config?.content).toContain('{{ actions.1.url }}');
    // Without its source the email editor opens empty
    expect(sendEmail.config?.contentFormat).toBe('maily');
    expect(JSON.stringify(sendEmail.config?.contentJson)).toContain('{{ actions.1.url }}');
  });
});
