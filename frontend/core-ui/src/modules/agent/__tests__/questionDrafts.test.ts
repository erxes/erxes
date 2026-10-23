import { buildQuestionAnswer, hasQuestionAnswer } from '../questionDrafts';
import { readAskUserAnswers } from '../askUserAnswers';

const single = {
  question: 'What should the report cover?',
  options: [{ label: 'Sales' }, { label: 'Support' }],
};
const multi = { ...single, selectionMode: 'multi_select' as const };

describe('question answers', () => {
  it('accepts custom answers when suggestions exist', () => {
    expect(buildQuestionAnswer(single, [], '  Inventory turnover  ')).toBe(
      'Inventory turnover',
    );
  });

  it('preserves selected choices and typed details', () => {
    expect(
      buildQuestionAnswer(single, ['Sales'], 'Only the enterprise team'),
    ).toBe('Sales\nOnly the enterprise team');
    expect(
      buildQuestionAnswer(multi, ['Sales', 'Support'], 'Include renewals'),
    ).toEqual(['Sales', 'Support', 'Include renewals']);
  });

  it('supports custom-only multi-select answers', () => {
    expect(buildQuestionAnswer(multi, [], 'Inventory')).toEqual(['Inventory']);
  });

  it('requires a real selection or nonblank text', () => {
    expect(hasQuestionAnswer(buildQuestionAnswer(single, [], ' \n '))).toBe(
      false,
    );
    expect(hasQuestionAnswer(buildQuestionAnswer(multi, [], ''))).toBe(false);
    expect(
      hasQuestionAnswer(buildQuestionAnswer(single, ['Stale option'], '')),
    ).toBe(false);
  });

  it('reads single multi-select plus custom text live and after reload', () => {
    const answer = buildQuestionAnswer(
      multi,
      ['Sales', 'Support'],
      'Include renewals',
    );
    const expected = [
      { question: multi.question, answer: 'Sales, Support, Include renewals' },
    ];
    expect(readAskUserAnswers([multi], { answers: [answer] })).toEqual(
      expected,
    );
    expect(
      readAskUserAnswers([multi], {
        content: `User answered:\n${multi.question}: Sales, Support, Include renewals`,
      }),
    ).toEqual(expected);
  });

  it('reads a batch mixing custom text, selected options, and multiple choices', () => {
    const questions = [single, { question: 'Which period?' }, multi];
    const answers = [
      buildQuestionAnswer(single, [], 'Inventory'),
      'Since Monday',
      buildQuestionAnswer(multi, ['Sales', 'Support'], 'Regional only'),
    ];
    expect(readAskUserAnswers(questions, { answers })).toEqual([
      { question: single.question, answer: 'Inventory' },
      { question: 'Which period?', answer: 'Since Monday' },
      { question: multi.question, answer: 'Sales, Support, Regional only' },
    ]);
  });
});
