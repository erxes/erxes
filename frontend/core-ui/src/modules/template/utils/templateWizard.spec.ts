import {
  countUnansweredTemplateSteps,
  firstOpenTemplateStep,
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
  it('counts what is left and shows the first waiting step', () => {
    expect(countUnansweredTemplateSteps(requirements, { brain: 'a' })).toBe(2);
    expect(firstOpenTemplateStep(requirements, { brain: 'a' })).toBe(1);
    expect(
      firstOpenTemplateStep(requirements, { brain: 'a', bot: 'b', offer: 'c' }),
    ).toBe(2);
  });
});
