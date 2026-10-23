import {
  buildAskUserResult,
  formatAskUserAnswers,
  readAskUserAnswers,
  readAskUserQuestionsFromInput,
} from '../askUserAnswers';

const questions = (texts: string[]) =>
  texts.map((question) => ({ question }));

describe('readAskUserQuestionsFromInput', () => {
  it('reads the batched questions array', () => {
    const input = {
      questions: [
        { question: 'Which chart?', options: [{ label: 'Bar' }] },
        { question: 'Which format?', selectionMode: 'multi_select' },
      ],
    };

    expect(readAskUserQuestionsFromInput(input)).toEqual([
      { question: 'Which chart?', options: [{ label: 'Bar' }] },
      { question: 'Which format?', selectionMode: 'multi_select' },
    ]);
  });

  it('normalizes the legacy single-question payload', () => {
    expect(
      readAskUserQuestionsFromInput({ question: 'Legacy?', options: [{ label: 'A' }] }),
    ).toEqual([{ question: 'Legacy?', options: [{ label: 'A' }] }]);
  });

  it('drops malformed entries and non-object input', () => {
    expect(readAskUserQuestionsFromInput({ questions: [{}, { question: 'ok' }] })).toEqual([
      { question: 'ok' },
    ]);
    expect(readAskUserQuestionsFromInput('nope')).toEqual([]);
    expect(readAskUserQuestionsFromInput(null)).toEqual([]);
  });
});

describe('readAskUserAnswers — structured answers', () => {
  it('pairs a multi-question batch positionally', () => {
    const entries = readAskUserAnswers(questions(['Q1?', 'Q2?']), {
      content: 'ignored',
      answers: ['a1', ['b1', 'b2']],
    });

    expect(entries).toEqual([
      { question: 'Q1?', answer: 'a1' },
      { question: 'Q2?', answer: 'b1, b2' },
    ]);
  });

  it('wraps a single question answer in the legacy shapes', () => {
    expect(readAskUserAnswers(questions(['Q?']), { answers: 'one' })).toEqual([
      { question: 'Q?', answer: 'one' },
    ]);
    expect(readAskUserAnswers(questions(['Q?']), { answers: ['a', 'b'] })).toEqual([
      { question: 'Q?', answer: 'a, b' },
    ]);
  });

  it('rejects incomplete or non-string answers', () => {
    expect(readAskUserAnswers(questions(['Q1?', 'Q2?']), { answers: ['a1'] })).toBeNull();
    expect(
      readAskUserAnswers(questions(['Q?']), { answers: [{ nope: true }] }),
    ).toBeNull();
  });
});

describe('readAskUserAnswers — stored content', () => {
  it('parses the batched stored format, pairing on the question prefixes', () => {
    const entries = readAskUserAnswers(
      questions(['Which module?', 'What dataset size?']),
      {
        content:
          'User answered:\nWhich module?: CRM\nWhat dataset size?: Small',
        isError: false,
      },
    );

    expect(entries).toEqual([
      { question: 'Which module?', answer: 'CRM' },
      { question: 'What dataset size?', answer: 'Small' },
    ]);
  });

  it('keeps answers that contain colons, commas or newlines', () => {
    const entries = readAskUserAnswers(questions(['Q1?', 'Q2?']), {
      content: 'User answered:\nQ1?: Time: noon, daily\nQ2?: line one\nline two',
    });

    expect(entries).toEqual([
      { question: 'Q1?', answer: 'Time: noon, daily' },
      { question: 'Q2?', answer: 'line one\nline two' },
    ]);
  });

  it('keeps the (no answer) placeholder as the answer text', () => {
    const entries = readAskUserAnswers(questions(['Q1?', 'Q2?']), {
      content: 'User answered:\nQ1?: (no answer)\nQ2?: yes',
    });

    expect(entries).toEqual([
      { question: 'Q1?', answer: '(no answer)' },
      { question: 'Q2?', answer: 'yes' },
    ]);
  });

  it('parses the legacy single-line format for one question', () => {
    expect(
      readAskUserAnswers(questions(['What next?']), {
        content: 'User answered: Explore data',
      }),
    ).toEqual([{ question: 'What next?', answer: 'Explore data' }]);
  });

  it('returns null when a question is missing from the content', () => {
    expect(
      readAskUserAnswers(questions(['Q1?', 'Q2?']), {
        content: 'User answered:\nQ1?: a1',
      }),
    ).toBeNull();
    expect(readAskUserAnswers(questions(['Q?']), { content: 'garbage' })).toBeNull();
    expect(readAskUserAnswers(questions(['Q?']), undefined)).toBeNull();
    expect(readAskUserAnswers([], { content: 'User answered: x' })).toBeNull();
  });
});

describe('buildAskUserResult', () => {
  it('mirrors the backend tool result for a batched suspension', () => {
    const result = buildAskUserResult(questions(['Q1?', 'Q2?']), ['a1', ['b1', 'b2']]);

    expect(result).toEqual({
      content: 'User answered:\nQ1?: a1\nQ2?: b1, b2',
      isError: false,
      answers: ['a1', ['b1', 'b2']],
    });
  });

  it('wraps a single multi-select answer without splitting it positionally', () => {
    const result = buildAskUserResult(questions(['Q?']), ['a', 'b']);

    expect(result).toEqual({
      content: 'User answered:\nQ?: a, b',
      isError: false,
      answers: [['a', 'b']],
    });
  });

  it('round-trips through the content parser', () => {
    const result = buildAskUserResult(questions(['Q1?', 'Q2?']), ['a 1', 'b 2']);

    expect(readAskUserAnswers(questions(['Q1?', 'Q2?']), result)).toEqual([
      { question: 'Q1?', answer: 'a 1' },
      { question: 'Q2?', answer: 'b 2' },
    ]);
  });
});

describe('formatAskUserAnswers', () => {
  it('joins per-question answers with the legacy separator', () => {
    expect(
      formatAskUserAnswers([
        { question: 'Q1?', answer: 'Bar chart' },
        { question: 'Q2?', answer: 'HTML preview' },
      ]),
    ).toBe('Bar chart · HTML preview');
  });

  it('keeps a multi-select answer joined with commas', () => {
    expect(formatAskUserAnswers([{ question: 'Q?', answer: 'a, b' }])).toBe(
      'a, b',
    );
  });

  it('returns the answer as-is for a single question', () => {
    expect(formatAskUserAnswers([{ question: 'Q?', answer: 'Yes' }])).toBe(
      'Yes',
    );
  });
});
