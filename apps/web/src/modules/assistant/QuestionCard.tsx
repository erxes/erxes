import { IconMessageQuestion } from '@tabler/icons-react';
import { Button, Checkbox, Input, Label, RadioGroup } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from './transcriptRows';

interface Draft {
  picked: string[];
  own: string;
}

const EMPTY: Draft = { picked: [], own: '' };

const answerOf = (question: Question, draft: Draft): string | string[] | null => {
  const own = draft.own.trim();

  if (question.selectionMode === 'multi_select') {
    const all = own ? [...draft.picked, own] : draft.picked;

    return all.length ? all : null;
  }

  return own || draft.picked[0] || null;
};

const OptionLabel = ({
  htmlFor,
  label,
  description,
}: {
  htmlFor: string;
  label: string;
  description?: string;
}) => (
  <Label htmlFor={htmlFor} variant="plain">
    <span className="flex flex-col gap-0.5">
      <span>{label}</span>
      {description && <span className="text-xs text-muted-foreground">{description}</span>}
    </span>
  </Label>
);

const Options = ({
  question,
  draft,
  onChange,
}: {
  question: Question;
  draft: Draft;
  onChange: (picked: string[]) => void;
}) => {
  const id = useId();

  if (question.selectionMode === 'multi_select') {
    return (
      <div className="flex flex-col gap-1.5">
        {question.options.map((option, index) => (
          <div key={option.label} className="flex items-start gap-2">
            <Checkbox
              id={`${id}-${index}`}
              checked={draft.picked.includes(option.label)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...draft.picked, option.label]
                    : draft.picked.filter((label) => label !== option.label),
                )
              }
            />
            <OptionLabel htmlFor={`${id}-${index}`} {...option} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <RadioGroup value={draft.picked[0] ?? ''} onValueChange={(value) => onChange([value])}>
      {question.options.map((option, index) => (
        <div key={option.label} className="flex items-start gap-2">
          <RadioGroup.Item id={`${id}-${index}`} value={option.label} />
          <OptionLabel htmlFor={`${id}-${index}`} {...option} />
        </div>
      ))}
    </RadioGroup>
  );
};

const QuestionField = ({
  question,
  draft,
  onChange,
}: {
  question: Question;
  draft: Draft;
  onChange: (draft: Draft) => void;
}) => {
  const { t } = useTranslation('assistant');
  const ownId = useId();

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{question.question}</legend>
      {question.options.length > 0 && (
        <Options
          question={question}
          draft={draft}
          onChange={(picked) => onChange({ ...draft, picked })}
        />
      )}
      <Label htmlFor={ownId} className="sr-only">
        {t('question.own', 'Your own answer')}
      </Label>
      <Input
        id={ownId}
        value={draft.own}
        placeholder={
          question.options.length
            ? t('question.own-placeholder', 'Or write your own answer')
            : t('question.answer-placeholder', 'Your answer')
        }
        onChange={(event) => onChange({ ...draft, own: event.target.value })}
      />
    </fieldset>
  );
};

export const QuestionCard = ({
  questions,
  disabled,
  onAnswer,
}: {
  questions: Question[];
  disabled: boolean;
  onAnswer: (answers: (string | string[])[]) => void;
}) => {
  const { t } = useTranslation('assistant');
  const headingId = useId();
  const [drafts, setDrafts] = useState<Draft[]>(() => questions.map(() => EMPTY));

  const answers = questions.map((question, index) => answerOf(question, drafts[index] ?? EMPTY));

  const complete = answers.every((answer) => answer !== null);

  const change = (index: number, draft: Draft) =>
    setDrafts((current) => current.map((entry, at) => (at === index ? draft : entry)));

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-lg border border-primary/40 bg-primary/5 p-3"
    >
      <h3 id={headingId} className="flex items-center gap-2 text-sm font-semibold">
        <IconMessageQuestion aria-hidden className="size-4 text-primary-text" />
        {t('question.title', 'The assistant needs your answer')}
      </h3>
      {questions.map((question, index) => (
        <QuestionField
          key={question.question}
          question={question}
          draft={drafts[index] ?? EMPTY}
          onChange={(draft) => change(index, draft)}
        />
      ))}
      <Button
        className="self-start"
        disabled={disabled || !complete}
        onClick={() => onAnswer(answers.flatMap((answer) => (answer === null ? [] : [answer])))}
      >
        {t('question.send', 'Send answers')}
      </Button>
    </section>
  );
};

export const AnsweredCard = ({ answers }: { answers: { question: string; answer: string }[] }) => {
  const { t } = useTranslation('assistant');

  return (
    <section className="flex flex-col gap-2 rounded-lg border p-3">
      <h3 className="text-xs font-medium text-muted-foreground">
        {t('question.answered', 'You answered')}
      </h3>
      <dl className="flex flex-col gap-2 text-sm">
        {answers.map(({ question, answer }) => (
          <div key={question}>
            <dt className="text-muted-foreground">{question}</dt>
            <dd className="font-medium">{answer || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
