import { TTemplateJourney } from 'erxes-api-shared/core-modules';
import { buildJourneyPreview } from '@/template/preview';

const nodes = new Map([
  [
    'frontline:facebook.messages',
    { label: 'Facebook Message', icon: 'IconBrandMessenger' },
  ],
  ['aiAgent', { label: 'AI Agent', icon: 'IconBrain' }],
  ['reply', { label: 'Send message', icon: 'IconMessage' }],
  ['ticket', { label: 'Create ticket', icon: 'IconTicket' }],
]);

const journey: TTemplateJourney = {
  key: 'chat',
  name: 'Chat',
  trigger: { type: 'frontline:facebook.messages' },
  flow: [
    {
      order: 1,
      type: 'aiAgent',
      label: 'Complaint employee',
      next: 2,
      connects: { file: 3 },
    },
    { order: 2, type: 'reply', label: 'Reply' },
    { order: 3, type: 'ticket' },
  ],
};

describe('buildJourneyPreview', () => {
  it('reads the trigger, the entry step and the steps after it', () => {
    expect(buildJourneyPreview(journey, nodes)).toEqual({
      trigger: { label: 'Facebook Message', icon: 'IconBrandMessenger' },
      hub: { label: 'Complaint employee', icon: 'IconBrain' },
      branches: [
        { label: 'Reply', icon: 'IconMessage' },
        { label: 'Create ticket', icon: 'IconTicket' },
      ],
    });
  });

  it('prefers the short names a template declares', () => {
    const preview = buildJourneyPreview(
      { ...journey, highlights: [{ order: 3, label: 'Ticket' }] },
      nodes,
    );

    expect(preview.branches).toEqual([{ label: 'Ticket', icon: 'IconTicket' }]);
  });
});
