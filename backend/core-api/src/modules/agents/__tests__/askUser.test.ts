import { askUserResumeSchema, normalizeAskUserResume } from '@/agents/askUser';

const questions = [
  { question: 'Which subjects?' },
  { question: 'Which period?' },
];

describe('ask_user resume contract', () => {
  it('accepts the mixed positional payload sent by the question UI', () => {
    const answer = [['Sales', 'Support', 'Regional only'], 'Last month'];
    expect(askUserResumeSchema.safeParse(answer).success).toBe(true);
    expect(normalizeAskUserResume(questions, answer)).toEqual(answer);
  });

  it('keeps a single multi-select response together', () => {
    expect(
      normalizeAskUserResume(questions.slice(0, 1), ['Sales', 'Support']),
    ).toEqual([['Sales', 'Support']]);
  });

  it('accepts text-only and selected options with custom details', () => {
    expect(
      normalizeAskUserResume(questions, [
        'Inventory\nWarehouses only',
        'Since Monday',
      ]),
    ).toEqual(['Inventory\nWarehouses only', 'Since Monday']);
    expect(normalizeAskUserResume(questions.slice(0, 1), 'Inventory')).toEqual([
      'Inventory',
    ]);
  });

  it('accepts legacy structured question-answer pairs by question', () => {
    expect(
      normalizeAskUserResume(questions, [
        { question: 'Which period?', answer: 'This month' },
        { question: 'Which subjects?', answer: ['Sales', 'Support'] },
      ]),
    ).toEqual([['Sales', 'Support'], 'This month']);
  });

  it.each([
    null,
    [],
    ['Sales'],
    ['Sales', ' '],
    [[''], 'Last month'],
    ['Sales', 'Last month', 'Extra'],
    { answer: 'Sales' },
  ])('rejects missing, empty, and malformed batch answers: %j', (answer) => {
    expect(normalizeAskUserResume(questions, answer)).toBeNull();
  });
});
