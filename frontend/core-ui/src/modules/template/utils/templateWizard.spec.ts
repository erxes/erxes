import {
  countUnansweredTemplateSteps,
  defaultTemplateAnswers,
  firstUnansweredTemplateStep,
  groupTemplateRequirements,
  isTemplateDefaultAnswer,
  orderTemplateRequirements,
  splitTemplatePlaceholders,
  templateAnswerText,
  templateJourneyShortName,
  templateMemberIds,
  isTemplateStepOpen,
} from '@/template/utils/templateWizard';

const requirements = [
  { key: 'brain', kind: 'automations:aiAgent', label: 'AI connection' },
  { key: 'bot', kind: 'frontline:telegram.bot', label: 'Telegram bot' },
  {
    key: 'offer',
    kind: 'core:text',
    label: 'Discount ceiling',
    dependsOn: 'brain',
  },
];

describe('isTemplateStepOpen', () => {
  it('opens the first step and closes everything after an unanswered one', () => {
    expect(isTemplateStepOpen(requirements, 0, {})).toBe(true);
    expect(isTemplateStepOpen(requirements, 1, {})).toBe(false);
    expect(isTemplateStepOpen(requirements, 2, { brain: 'a' })).toBe(false);
  });

  it('opens a step once all before it are answered', () => {
    expect(isTemplateStepOpen(requirements, 2, { brain: 'a', bot: 'b' })).toBe(
      true,
    );
  });

  it('treats empty text as unanswered', () => {
    expect(isTemplateStepOpen(requirements, 1, { brain: '' })).toBe(false);
  });
});

describe('progress', () => {
  it('counts what is left', () => {
    expect(countUnansweredTemplateSteps(requirements, { brain: 'a' })).toBe(2);
  });
});

describe('defaultTemplateAnswers', () => {
  it('opens with declared answers and the installer as who takes over', () => {
    expect(
      defaultTemplateAnswers(
        [
          {
            key: 'policy',
            kind: 'core:text',
            label: 'Policy',
            defaultAnswer: 'Refund in 7 days',
          },
          { key: 'team', kind: 'core:team.members', label: 'Team' },
          { key: 'fallback', kind: 'core:team.member', label: 'Fallback' },
          { key: 'page', kind: 'frontline:facebook.bot', label: 'Page' },
        ],
        'me',
      ),
    ).toEqual({
      policy: 'Refund in 7 days',
      team: '[[ user.me ]]',
      fallback: '[[ user.me ]]',
    });
  });
});

describe('ordering and grouping', () => {
  const mixed = [
    { key: 'page', kind: 'frontline:facebook.bot', label: 'Page' },
    { key: 'policy', kind: 'core:text', label: 'Policy' },
    { key: 'team', kind: 'core:team.members', label: 'Team' },
    { key: 'pos', kind: 'sales:pos.pos', label: 'POS' },
    { key: 'lead', kind: 'core:team.member', label: 'Lead' },
  ];

  it('asks connections, then people, then wording, keeping their order', () => {
    const ordered = orderTemplateRequirements(mixed);

    expect(ordered.map(({ key }) => key)).toEqual([
      'page',
      'pos',
      'team',
      'lead',
      'policy',
    ]);
    expect(
      groupTemplateRequirements(ordered).map(({ group, steps }) => [
        group,
        steps.map(({ index }) => index),
      ]),
    ).toEqual([
      ['connect', [0, 1]],
      ['people', [2, 3]],
      ['words', [4]],
    ]);
  });

  it('finds the first step still waiting, or none', () => {
    const ordered = orderTemplateRequirements(mixed);

    expect(firstUnansweredTemplateStep(ordered, { page: 'p' })).toBe('pos');
    expect(
      firstUnansweredTemplateStep(ordered, {
        page: 'p',
        pos: 'x',
        team: 't',
        lead: 'l',
        policy: 'y',
      }),
    ).toBeNull();
  });
});

describe('answer helpers', () => {
  it('tells a default answer from a changed one', () => {
    expect(isTemplateDefaultAnswer('Refund', 'Refund')).toBe(true);
    expect(isTemplateDefaultAnswer('Refund in 3 days', 'Refund')).toBe(false);
    expect(isTemplateDefaultAnswer('', '')).toBe(false);
  });

  it('reads member ids from picker tokens', () => {
    expect(templateMemberIds('[[ user.a ]],[[ user.b ]]')).toEqual(['a', 'b']);
    expect(templateMemberIds(undefined)).toEqual([]);
  });

  it('says an answer in one line without showing ids', () => {
    expect(templateAnswerText('core:text', 'Up to 10%\nnever more')).toBe(
      'Up to 10%',
    );
    expect(
      templateAnswerText('core:emails.content', { subject: 'Your order' }),
    ).toBe('Your order');
    expect(
      templateAnswerText('core:emails.sender', {
        name: 'Shop',
        value: 'hi@shop.mn',
      }),
    ).toBe('Shop · hi@shop.mn');
    expect(templateAnswerText('frontline:facebook.bot', 'bot-id')).toBe('');
  });

  it('splits placeholders out of a text', () => {
    expect(splitTemplatePlaceholders('Order #{{ trigger.number }} paid')).toEqual([
      { text: 'Order #', isToken: false },
      { text: 'trigger.number', isToken: true },
      { text: ' paid', isToken: false },
    ]);
  });

  it('drops the template name from a journey name', () => {
    expect(templateJourneyShortName('Sales employee · Paid', 'Sales employee')).toBe('Paid');
    expect(templateJourneyShortName('Paid', 'Sales employee')).toBe('Paid');
  });
});
