// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { QuestionCard } from '../QuestionCard';
import type { Question } from '../transcriptRows';

let root: Root | null = null;

beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const team: Question = { question: 'Which team?', options: [] };
const member: Question = { question: 'Which member?', options: [] };

const type = (input: HTMLInputElement | undefined, text: string) => {
  if (!input) throw new Error('No input to type in');

  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('QuestionCard', () => {
  it('takes an answer to a question that arrived after the card was shown', () => {
    const container = document.createElement('div');
    const client = new QueryClient();
    const sent: (string | string[])[][] = [];

    document.body.append(container);

    const mounted = createRoot(container);

    root = mounted;

    const card = (questions: Question[]) =>
      createElement(
        QueryClientProvider,
        { client },
        createElement(QuestionCard, {
          questions,
          disabled: false,
          onAnswer: (answers) => sent.push(answers),
        }),
      );

    act(() => mounted.render(card([team])));
    act(() => mounted.render(card([team, member])));

    const inputs = [...container.querySelectorAll('input')];

    act(() => type(inputs[0], 'Sales'));
    act(() => type(inputs[1], 'Bat'));
    act(() => container.querySelector('button')?.click());

    expect(sent).toEqual([['Sales', 'Bat']]);
  });
});
