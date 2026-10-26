import {
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconCircle,
  IconCircleCheckFilled,
  IconLoader2,
  IconMessageQuestion,
  IconPencil,
  IconSquare,
  IconSquareCheckFilled,
} from '@tabler/icons-react';
import { Button, Textarea, cn } from 'erxes-ui';
import { useEffect, useId, useRef, useState } from 'react';

import type { IAskUserAnswerEntry } from '../askUserAnswers';
import { buildQuestionAnswer, hasQuestionAnswer } from '../questionDrafts';

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
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const answers = questions.map((question, index) =>
    buildQuestionAnswer(question, picked[index] ?? [], drafts[index] ?? ''),
  );
  const answeredCount = answers.filter(hasQuestionAnswer).length;
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;
  const reviewing = step === questions.length;
  const question = questions[step];
  const selected = picked[step] ?? [];
  const multi = question?.selectionMode === 'multi_select';
  const hasOptions = Boolean(question?.options?.length);
  const canAdvance = hasQuestionAnswer(answers[step] ?? '');
  const labelId = `${id}-question`;

  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [step]);

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
    if (busy) return;
    if (!reviewing && questions.length > 1) {
      if (canAdvance) setStep(step + 1);
      return;
    }
    if (!allAnswered) return;
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
      className="my-3 min-w-0 overflow-hidden rounded-2xl border bg-card text-foreground"
      aria-label="Questions from your agent"
      aria-busy={busy}
    >
      <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium">
          <IconMessageQuestion className="size-4 shrink-0 text-muted-foreground" />
          <span>{reviewing ? 'Review your answers' : 'Your input'}</span>
        </div>
        <span
          className="shrink-0 text-xs tabular-nums text-muted-foreground"
          role="status"
        >
          {busy
            ? 'Sending…'
            : reviewing
            ? `${answeredCount} answered`
            : `${step + 1} of ${questions.length}`}
        </span>
      </div>
      {questions.length > 1 && (
        <nav
          className="flex gap-1.5 px-4 pt-4 sm:px-5"
          aria-label="Question progress"
        >
          {questions.map((entry, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 min-w-0 flex-1 gap-1 rounded-md px-1 text-[11px] tabular-nums',
                step === index
                  ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
                  : 'text-muted-foreground',
              )}
              aria-label={`Question ${index + 1}: ${entry.question}`}
              aria-current={step === index ? 'step' : undefined}
              disabled={
                busy ||
                (index > step &&
                  !answers.slice(0, index).every(hasQuestionAnswer))
              }
              onClick={() => setStep(index)}
            >
              {hasQuestionAnswer(answers[index]) && (
                <IconCheck className="size-3" />
              )}
              {index + 1}
            </Button>
          ))}
        </nav>
      )}
      {reviewing ? (
        <section className="px-4 py-5 sm:px-5" aria-labelledby={labelId}>
          <h3
            ref={headingRef}
            id={labelId}
            tabIndex={-1}
            className="text-base font-semibold outline-none"
          >
            Everything look right?
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Send these answers to continue the conversation.
          </p>
          <dl className="mt-4 divide-y">
            {questions.map((entry, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <dt className="text-xs leading-5 text-muted-foreground">
                    {entry.question}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere]">
                    {Array.isArray(answers[index])
                      ? answers[index].join(', ')
                      : answers[index]}
                  </dd>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground"
                  aria-label={`Edit answer ${index + 1}`}
                  disabled={busy}
                  onClick={() => setStep(index)}
                >
                  <IconPencil className="size-3.5" />
                </Button>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        question && (
          <section
            className="space-y-4 px-4 py-5 sm:px-5"
            aria-labelledby={labelId}
          >
            <div>
              <h3
                ref={headingRef}
                id={labelId}
                tabIndex={-1}
                className="text-base font-semibold leading-6 tracking-tight outline-none [overflow-wrap:anywhere]"
              >
                {question.question}
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {hasOptions
                  ? multi
                    ? 'Select all that apply, or write your own answer.'
                    : 'Choose an option, or write your own answer.'
                  : 'A little context helps me get this right.'}
              </p>
            </div>
            {hasOptions && (
              <div
                className="flex flex-col gap-2"
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
                      onClick={() => togglePick(step, option.label)}
                      className={cn(
                        'h-auto min-h-12 w-full items-start justify-start gap-3 whitespace-normal rounded-xl border px-3.5 py-3 text-left shadow-none transition-colors',
                        active
                          ? 'border-primary/60 bg-primary/5 hover:bg-primary/10'
                          : 'border-border/70 bg-transparent hover:border-foreground/25 hover:bg-muted/40',
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          'mt-0.5 size-4 shrink-0',
                          active ? 'text-primary' : 'text-muted-foreground/50',
                        )}
                      />
                      <span className="min-w-0 [overflow-wrap:anywhere]">
                        <span className="block text-sm font-medium leading-5">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </span>
                    </Button>
                  );
                })}
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor={`${id}-answer-${step}`}
                className="block text-xs font-medium text-muted-foreground"
              >
                {hasOptions
                  ? selected.length > 0
                    ? 'Add details (optional)'
                    : 'Your own answer'
                  : 'Your answer'}
              </label>
              <Textarea
                id={`${id}-answer-${step}`}
                value={drafts[step] ?? ''}
                onChange={(event) =>
                  setDrafts((current) =>
                    current.map((draft, index) =>
                      index === step ? event.target.value : draft,
                    ),
                  )
                }
                placeholder={
                  hasOptions && selected.length > 0
                    ? 'Anything else I should know?'
                    : 'Type your answer…'
                }
                aria-label={`Your answer: ${question.question}`}
                disabled={busy}
                rows={3}
                className="max-h-48 min-h-20 resize-y rounded-xl border bg-background px-3 py-2.5 text-sm leading-6 shadow-none placeholder:text-muted-foreground/60 focus-visible:border-primary/50"
              />
            </div>
          </section>
        )
      )}
      <div className="flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            disabled={busy}
            onClick={() => setStep(step - 1)}
          >
            <IconChevronLeft className="size-3.5" />
            Back
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {multi && selected.length > 0
              ? `${selected.length} selected`
              : 'Reply to continue'}
          </p>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={busy || (reviewing ? !allAnswered : !canAdvance)}
          className="min-h-8 shrink-0 gap-2 rounded-lg px-3"
        >
          {busy
            ? 'Sending…'
            : reviewing || questions.length === 1
            ? 'Send answer'
            : step === questions.length - 1
            ? 'Review answers'
            : 'Next'}
          {busy ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconArrowRight className="size-3.5" />
          )}
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
