import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconCircle,
  IconCircleCheckFilled,
  IconLoader2,
  IconMessageQuestion,
  IconPencil,
  IconSquare,
  IconSquareCheckFilled,
} from '@tabler/icons-react';
import { Badge, Button, Textarea, cn } from 'erxes-ui';
import { useEffect, useId, useRef, useState } from 'react';

import {
  splitAskUserAnswer,
  type IAskUserAnswerEntry,
} from '../askUserAnswers';
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

/** Shared by the live card and its answered summary so both read as one. */
const CARD_CLASS =
  'my-2 min-w-0 overflow-hidden rounded-xl border bg-card text-foreground';
const HEADER_CLASS =
  'flex items-center justify-between gap-3 border-b bg-muted/20 px-4 py-2.5';
const QUESTION_CLASS =
  'text-xs leading-5 text-muted-foreground [overflow-wrap:anywhere]';

/**
 * One answer as the user gave it: picked options as chips, their own words
 * as a separate text line.
 */
const AnswerValue = ({
  answer,
  question,
}: {
  answer: string | string[];
  question?: IAskUserQuestionEntry;
}) => {
  const { choices, custom } = splitAskUserAnswer(answer, question);
  const hasOptions = Boolean(question?.options?.length);

  return (
    <dd className="mt-1.5 flex min-w-0 flex-wrap items-start gap-1.5">
      {choices.map((choice) => (
        <Badge
          key={choice}
          className="h-auto min-h-6 max-w-full whitespace-normal rounded-md py-0.5 leading-5 [overflow-wrap:anywhere]"
        >
          <IconCheck aria-hidden="true" className="size-3 shrink-0" />
          {choice}
        </Badge>
      ))}
      {custom && (
        <p className="flex w-full min-w-0 items-start gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-sm leading-6">
          {hasOptions && (
            <>
              <IconPencil
                aria-hidden="true"
                className="mt-1 size-3.5 shrink-0 text-muted-foreground"
              />
              <span className="sr-only">Your own answer: </span>
            </>
          )}
          <span className="min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]">
            {custom}
          </span>
        </p>
      )}
    </dd>
  );
};

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
      className={cn(
        CARD_CLASS,
        'transition-opacity motion-reduce:transition-none',
        busy && 'opacity-80',
      )}
      aria-label="Questions from your agent"
      aria-busy={busy}
    >
      <div className={HEADER_CLASS}>
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
        <nav className="flex gap-1.5 px-4 pt-3" aria-label="Question progress">
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
        <section className="px-4 pt-4" aria-labelledby={labelId}>
          <h3
            ref={headingRef}
            id={labelId}
            tabIndex={-1}
            className="text-sm font-semibold leading-6 outline-none"
          >
            Everything look right?
          </h3>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Send these answers to continue the conversation.
          </p>
          <dl className="mt-2 divide-y">
            {questions.map((entry, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <dt className={QUESTION_CLASS}>{entry.question}</dt>
                  <AnswerValue answer={answers[index] ?? ''} question={entry} />
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
          <section className="space-y-3.5 px-4 py-4" aria-labelledby={labelId}>
            <div>
              <h3
                ref={headingRef}
                id={labelId}
                tabIndex={-1}
                className="text-sm font-semibold leading-6 outline-none [overflow-wrap:anywhere]"
              >
                {question.question}
              </h3>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {hasOptions
                  ? multi
                    ? 'Select all that apply, or write your own answer.'
                    : 'Choose an option, or write your own answer.'
                  : 'A little context helps me get this right.'}
              </p>
            </div>
            {hasOptions && (
              <div
                className="flex flex-col gap-1.5"
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
                        'h-auto min-h-10 w-full items-start justify-start gap-2.5 whitespace-normal rounded-lg border px-3 py-2.5 text-left shadow-none transition-colors',
                        active
                          ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
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
                className="max-h-48 min-h-20 resize-y rounded-lg border bg-background px-3 py-2.5 text-sm leading-6 shadow-none placeholder:text-muted-foreground/60 focus-visible:border-primary/50"
              />
            </div>
          </section>
        )
      )}
      <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
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

/** Longer groups show this many pairs until the reader expands them. */
const COLLAPSED_ANSWER_COUNT = 3;

/**
 * Persisted summary that replaces the live card after submission: the same
 * surface and header bar, each question with its answer as chips (picked
 * options) and/or a text line (the user's own words). It settles in with a
 * short fade (none for reduced motion).
 */
export const AskUserAnswered = ({
  answers,
  questions,
}: {
  answers: IAskUserAnswerEntry[];
  /** The asked questions, positionally; lets picks render as chips. */
  questions?: IAskUserQuestionEntry[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const collapsible = answers.length > COLLAPSED_ANSWER_COUNT + 1;
  const visible =
    collapsible && !expanded
      ? answers.slice(0, COLLAPSED_ANSWER_COUNT)
      : answers;

  return (
    <section
      className={cn(CARD_CLASS, 'agent-ask-settle')}
      aria-label="Your answers"
    >
      <div className={HEADER_CLASS}>
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IconCheck aria-hidden="true" className="size-2.5" stroke={3} />
          </span>
          <span>Answered</span>
        </div>
        {answers.length > 1 && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {answers.length} questions
          </span>
        )}
      </div>
      <dl className="divide-y px-4">
        {visible.map((entry, index) => (
          <div key={index} className="py-3">
            <dt className={QUESTION_CLASS}>{entry.question}</dt>
            <AnswerValue answer={entry.answer} question={questions?.[index]} />
          </div>
        ))}
      </dl>
      {collapsible && (
        <div className="border-t px-2 py-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full gap-1 text-xs text-muted-foreground"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show fewer' : `Show all ${answers.length} answers`}
            <IconChevronDown
              aria-hidden="true"
              className={cn(
                'size-3.5 transition-transform motion-reduce:transition-none',
                expanded && 'rotate-180',
              )}
            />
          </Button>
        </div>
      )}
    </section>
  );
};
