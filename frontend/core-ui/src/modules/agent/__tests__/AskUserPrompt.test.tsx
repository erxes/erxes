/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AskUserPrompt } from '../components/AskUserPrompt';

jest.mock('erxes-ui', () => ({
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
  expect(screen.getByText('Sales, Support')).toBeTruthy();
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
