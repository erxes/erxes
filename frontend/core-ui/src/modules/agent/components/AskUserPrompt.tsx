import {
  IconArrowUp,
  IconCheck,
  IconCircle,
  IconCircleCheckFilled,
  IconLoader2,
  IconSquare,
  IconSquareCheckFilled,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useId, useState } from 'react';

import { POSES } from '../bloub/engine/states';
import { BotBadge } from './BotBadge';

import type { IAskUserAnswerEntry } from '../askUserAnswers';
import { buildQuestionAnswer, hasQuestionAnswer } from '../questionDrafts';
import { ChatInput } from './ChatInput';

export interface IAskUserQuestionEntry {
  question: string;
  options?: { label: string; description?: string }[];
  selectionMode?: 'single_select' | 'multi_select';
}

export interface IAskUserQuestionGroup {
  questions: IAskUserQuestionEntry[];
}

export interface IAskUserPromptProps {
  group: IAskUserQuestionGroup;
  busy: boolean;
  onAnswer: (answer: string | string[] | (string | string[])[]) => void;
}

/** Choices and custom answers share one explicit submission path. */
export const AskUserPrompt = ({
  group,
  busy,
  onAnswer,
}: IAskUserPromptProps) => {
  const { questions } = group;
  const id = useId();
  const [picked, setPicked] = useState<string[][]>(() =>
    questions.map(() => []),
  );
  const [drafts, setDrafts] = useState<string[]>(() => questions.map(() => ''));
  const answers = questions.map((question, index) =>
    buildQuestionAnswer(question, picked[index] ?? [], drafts[index] ?? ''),
  );
  const answeredCount = answers.filter(hasQuestionAnswer).length;
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;

  const togglePick = (index: number, label: string) => {
    if (busy) return;
    setPicked((current) =>
      current.map((selection, i) => {
        if (i !== index) return selection;
        if (selection.includes(label))
          return selection.filter((value) => value !== label);
        return questions[index]?.selectionMode === 'multi_select'
          ? [...selection, label]
          : [label];
      }),
    );
  };

  const submit = () => {
    if (busy || !allAnswered) return;
    const first = answers[0];
    if (first === undefined) return;
    onAnswer(questions.length === 1 ? first : answers);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="my-1 overflow-hidden rounded-2xl border bg-background text-foreground"
      aria-label="Questions from your agent"
    >
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <BotBadge
          size={20}
          state="notify"
          frozenAt={POSES.notify}
          className="size-8 rounded-lg"
        />
        <div>
          <p className="text-sm font-medium">
            {questions.length === 1
              ? 'One detail before I continue'
              : 'A few details before I continue'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose an option, write your own answer, or add details to your
            choices.
          </p>
        </div>
      </div>

      <div className="divide-y border-t">
        {questions.map((question, index) => {
          const multi = question.selectionMode === 'multi_select';
          const selected = picked[index] ?? [];
          const hasOptions = Boolean(question.options?.length);
          const labelId = `${id}-${index}`;
          return (
            <section
              key={index}
              className="space-y-3 px-4 py-4 sm:px-5 sm:py-5"
              aria-labelledby={labelId}
            >
              <div className="flex items-start gap-2.5">
                {questions.length > 1 && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 id={labelId} className="text-sm font-medium leading-5">
                    {question.question}
                  </h3>
                  {hasOptions && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {multi ? 'Choose any that apply' : 'Choose one'}
                      {multi && selected.length > 0
                        ? ` · ${selected.length} selected`
                        : ''}
                    </p>
                  )}
                </div>
              </div>

              {hasOptions && (
                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  role="group"
                  aria-labelledby={labelId}
                >
                  {question.options?.map((option) => {
                    const active = selected.includes(option.label);
                    const Icon = multi
                      ? active
                        ? IconSquareCheckFilled
                        : IconSquare
                      : active
                      ? IconCircleCheckFilled
                      : IconCircle;
                    return (
                      <Button
                        key={option.label}
                        type="button"
                        variant="outline"
                        disabled={busy}
                        aria-pressed={active}
                        onClick={() => togglePick(index, option.label)}
                        className={`h-auto min-h-11 justify-start gap-3 whitespace-normal rounded-xl px-3 py-2.5 text-left shadow-none ${
                          active
                            ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <Icon
                          aria-hidden="true"
                          className={`size-4 shrink-0 ${
                            active ? 'text-primary' : 'text-muted-foreground/60'
                          }`}
                        />
                        <span className="min-w-0 break-words">
                          <span className="block text-sm font-medium">
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="mt-1 block text-xs font-normal leading-4 text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              )}

              <div className="rounded-xl border bg-muted/20 px-3 py-2.5 transition-colors focus-within:border-primary/50 focus-within:bg-background">
                <ChatInput
                  value={drafts[index] ?? ''}
                  onChange={(value) =>
                    setDrafts((current) =>
                      current.map((draft, i) => (i === index ? value : draft)),
                    )
                  }
                  placeholder={
                    hasOptions
                      ? 'Your own answer or additional details…'
                      : 'Type your answer…'
                  }
                  ariaLabel={`Your answer: ${question.question}`}
                  disabled={busy}
                  maxHeight={144}
                  className="text-sm md:text-sm"
                />
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 sm:px-5">
        <p
          className="text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {busy
            ? 'Sending your answers…'
            : allAnswered
            ? 'Ready when you are'
            : `${answeredCount} of ${questions.length} answered`}
        </p>
        <Button
          type="submit"
          size="sm"
          disabled={busy || !allAnswered}
          className="shrink-0 rounded-lg"
        >
          {busy ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconArrowUp className="size-4" />
          )}
          {busy ? 'Sending…' : 'Continue'}
        </Button>
      </div>
    </form>
  );
};

/** Compact persisted summary replaces the active form after submission. */
export const AskUserAnswered = ({
  answers,
}: {
  answers: IAskUserAnswerEntry[];
}) => (
  <div className="my-2 space-y-3 border-l-2 border-primary/25 py-1 pl-4 text-foreground">
    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <IconCheck className="size-3.5 text-primary" />
      Your answers
    </p>
    {answers.map((entry, index) => (
      <div key={index}>
        <p className="text-xs text-muted-foreground">{entry.question}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
          {entry.answer}
        </p>
      </div>
    ))}
  </div>
);
