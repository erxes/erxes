/** @jest-environment jsdom */
import { fireEvent, render, screen, within } from '@testing-library/react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { AskUserAnswered, AskUserPrompt } from '../components/AskUserPrompt';

jest.mock('erxes-ui', () => ({
  Badge: (props: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="answer-chip" {...props} />
  ),
  Button: ({
    variant: _variant,
    size: _size,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }) => {
    void _variant;
    void _size;
    return <button {...props} />;
  },
  Textarea: (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
}));

const questions = [
  {
    question: 'Which period?',
    options: [
      { label: 'This month', description: 'From the first day through today.' },
      { label: 'Last month' },
    ],
  },
  {
    question: 'Which teams?',
    selectionMode: 'multi_select' as const,
    options: [{ label: 'Sales' }, { label: 'Support' }],
  },
  { question: 'What should I focus on?' },
];

it('requires an explicit send and accepts an option with additional context', () => {
  const onAnswer = jest.fn();
  render(
    <AskUserPrompt
      group={{ questions: [questions[0]] }}
      busy={false}
      onAnswer={onAnswer}
    />,
  );
  const send = screen.getByRole('button', {
    name: 'Send answer',
  }) as HTMLButtonElement;
  expect(send.disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: /This month/ }));
  expect(onAnswer).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Only closed deals' },
  });
  fireEvent.click(send);
  expect(onAnswer).toHaveBeenCalledWith('This month\nOnly closed deals');
});

it('keeps drafts when moving back, reviews all answers, and submits positionally', () => {
  const onAnswer = jest.fn();
  render(
    <AskUserPrompt group={{ questions }} busy={false} onAnswer={onAnswer} />,
  );
  expect(screen.queryByText('Which teams?')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /Last month/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sales' }));
  fireEvent.click(screen.getByRole('button', { name: 'Support' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(
    screen
      .getByRole('button', { name: 'Last month' })
      .getAttribute('aria-pressed'),
  ).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(
    screen.getByRole('button', { name: 'Sales' }).getAttribute('aria-pressed'),
  ).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Revenue by owner' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Review answers' }));
  expect(screen.getByText('Everything look right?')).toBeTruthy();
  const review = screen.getByRole('region', { name: 'Everything look right?' });
  expect(
    within(review)
      .getAllByTestId('answer-chip')
      .map((chip) => chip.textContent),
  ).toEqual(['Last month', 'Sales', 'Support']);
  expect(within(review).getByText('Revenue by owner')).toBeTruthy();
  expect(onAnswer).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Edit answer 1' }));
  fireEvent.click(screen.getByRole('button', { name: /This month/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(
    'Revenue by owner',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Review answers' }));
  fireEvent.click(screen.getByRole('button', { name: 'Send answer' }));
  expect(onAnswer).toHaveBeenCalledWith([
    'This month',
    ['Sales', 'Support'],
    'Revenue by owner',
  ]);
});

it('supports a custom response without selecting any suggested option', () => {
  const onAnswer = jest.fn();
  render(
    <AskUserPrompt
      group={{ questions: [questions[0]] }}
      busy={false}
      onAnswer={onAnswer}
    />,
  );
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '  Last quarter  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send answer' }));
  expect(onAnswer).toHaveBeenCalledWith('Last quarter');
});

it('prevents empty answers and interaction while submitting', () => {
  const onAnswer = jest.fn();
  const { rerender } = render(
    <AskUserPrompt
      group={{ questions: [questions[0]] }}
      busy={false}
      onAnswer={onAnswer}
    />,
  );
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
  expect(
    (screen.getByRole('button', { name: 'Send answer' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  rerender(
    <AskUserPrompt
      group={{ questions: [questions[0]] }}
      busy
      onAnswer={onAnswer}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /This month/ }));
  expect(
    screen
      .getByRole('button', { name: /This month/ })
      .getAttribute('aria-pressed'),
  ).toBe('false');
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(
    true,
  );
  expect(onAnswer).not.toHaveBeenCalled();
});

describe('AskUserAnswered', () => {
  const chips = () =>
    screen.queryAllByTestId('answer-chip').map((chip) => chip.textContent);

  it('shows a single picked option as an answer chip under an Answered label', () => {
    render(
      <AskUserAnswered
        answers={[{ question: 'Which period?', answer: 'Last month' }]}
        questions={[questions[0]]}
      />,
    );
    const card = screen.getByRole('region', { name: 'Your answers' });
    expect(within(card).getByText('Answered')).toBeTruthy();
    expect(within(card).getByText('Which period?')).toBeTruthy();
    expect(chips()).toEqual(['Last month']);
    expect(within(card).queryByText(/questions$/)).toBeNull();
  });

  it('renders every multi-select pick as its own chip', () => {
    render(
      <AskUserAnswered
        answers={[{ question: 'Which teams?', answer: 'Sales, Support' }]}
        questions={[questions[1]]}
      />,
    );
    expect(chips()).toEqual(['Sales', 'Support']);
  });

  it('separates custom text from picked options', () => {
    render(
      <AskUserAnswered
        answers={[
          {
            question: 'Which period?',
            answer: 'Last month\nOnly closed deals',
          },
          { question: 'Which teams?', answer: 'Sales, Marketing too' },
          { question: 'What should I focus on?', answer: 'Revenue by owner' },
        ]}
        questions={questions}
      />,
    );
    expect(chips()).toEqual(['Last month', 'Sales']);
    expect(screen.getByText('Only closed deals')).toBeTruthy();
    expect(screen.getByText('Marketing too')).toBeTruthy();
    expect(screen.getAllByText('Your own answer:')).toHaveLength(2);
    expect(screen.getByText('Revenue by owner')).toBeTruthy();
    expect(screen.getByText('3 questions')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Show all/ })).toBeNull();
  });

  it('falls back to plain text when the questions are unknown', () => {
    render(
      <AskUserAnswered
        answers={[{ question: 'Which teams?', answer: 'Sales, Support' }]}
      />,
    );
    expect(chips()).toEqual([]);
    expect(screen.getByText('Sales, Support')).toBeTruthy();
  });

  it('collapses long groups behind Show all N answers', () => {
    const answers = Array.from({ length: 6 }, (_, index) => ({
      question: `Question ${index + 1}?`,
      answer: `Answer ${index + 1}`,
    }));
    render(<AskUserAnswered answers={answers} />);
    expect(screen.getByText('Question 3?')).toBeTruthy();
    expect(screen.queryByText('Question 4?')).toBeNull();
    const toggle = screen.getByRole('button', { name: 'Show all 6 answers' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(screen.getByText('Question 6?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show fewer' }));
    expect(screen.queryByText('Question 6?')).toBeNull();
  });

  it('never hides a single extra answer behind the toggle', () => {
    const answers = Array.from({ length: 4 }, (_, index) => ({
      question: `Question ${index + 1}?`,
      answer: `Answer ${index + 1}`,
    }));
    render(<AskUserAnswered answers={answers} />);
    expect(screen.getByText('Question 4?')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Show all/ })).toBeNull();
  });
});
