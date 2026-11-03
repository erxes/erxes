import type { IAskUserQuestionEntry } from './components/AskUserPrompt';

/** Preserve custom text alongside selected options using the existing answer contract. */
export const buildQuestionAnswer = (
  question: IAskUserQuestionEntry,
  selected: string[],
  draft: string,
): string | string[] => {
  const text = draft.trim();
  const choices = selected.filter((label) =>
    question.options?.some((option) => option.label === label),
  );
  if (question.selectionMode === 'multi_select') {
    return [...choices, ...(text ? [text] : [])];
  }
  return [choices[0], text].filter(Boolean).join('\n');
};

export const hasQuestionAnswer = (answer: string | string[]): boolean =>
  Array.isArray(answer) ? answer.length > 0 : answer.trim().length > 0;
