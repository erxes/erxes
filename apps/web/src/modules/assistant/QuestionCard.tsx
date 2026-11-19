import { memberQueries } from '@erxes/core-contract/client';
import { IconMessageQuestion } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  Label,
  LookupPicker,
  RadioGroup,
  Textarea,
  toIsoDay,
  useMemberOptions,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from './transcriptRows';

interface Draft {
  picked: string[];
  own: string;
  named?: string[];
}

interface AnswerProps {
  question: Question;
  draft: Draft;
  onChange: (draft: Draft) => void;
}

const EMPTY: Draft = { picked: [], own: '' };

const answerOf = (question: Question, draft: Draft): string | string[] | null => {
  const own = draft.own.trim();
  const picked = draft.named ?? draft.picked;

  if (question.selectionMode === 'multi_select') {
    const all = own ? [...picked, own] : picked;

    return all.length ? all : null;
  }

  return own || picked[0] || null;
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

const MemberAnswer = ({ question, draft, onChange }: AnswerProps) => {
  const { t } = useTranslation('assistant');
  const members = useMemberOptions(memberQueries, true, draft.picked);

  const nameOf = (id: string) => {
    const label = members.options.find((option) => option.value === id)?.label;

    return label ? `${label} (member id ${id})` : `member id ${id}`;
  };

  return (
    <LookupPicker
      multiple={question.selectionMode === 'multi_select'}
      lookup={members}
      value={draft.picked}
      placeholder={t('question.member-placeholder', 'Choose a team member…')}
      onValueChange={(ids) => onChange({ ...draft, picked: ids, named: ids.map(nameOf) })}
    />
  );
};

const WrittenAnswer = ({ question, draft, onChange }: AnswerProps) => {
  const { t } = useTranslation('assistant');
  const id = useId();
  const component = question.options.length ? 'text' : (question.component ?? 'text');
  const setOwn = (own: string) => onChange({ ...draft, own });

  const placeholder = question.options.length
    ? t('question.own-placeholder', 'Or write your own answer')
    : t('question.answer-placeholder', 'Your answer');

  if (component === 'date') {
    return (
      <DatePicker
        value={draft.own || undefined}
        placeholder={t('question.date-placeholder', 'Choose a date')}
        onChange={(date) => setOwn(date instanceof Date ? toIsoDay(date) : '')}
      />
    );
  }

  return (
    <>
      <Label htmlFor={id} className="sr-only">
        {t('question.own', 'Your own answer')}
      </Label>
      {component === 'long_text' ? (
        <Textarea
          id={id}
          rows={3}
          value={draft.own}
          placeholder={placeholder}
          onChange={(event) => setOwn(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          type={component === 'number' ? 'number' : 'text'}
          value={draft.own}
          placeholder={placeholder}
          onChange={(event) => setOwn(event.target.value)}
        />
      )}
    </>
  );
};

const QuestionField = (props: AnswerProps) => {
  const { question, draft, onChange } = props;
  const picksMember = question.component === 'member' && question.options.length === 0;

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
      {picksMember ? <MemberAnswer {...props} /> : <WrittenAnswer {...props} />}
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
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const draftOf = (question: Question) => drafts[question.question] ?? EMPTY;
  const answers = questions.map((question) => answerOf(question, draftOf(question)));
  const complete = answers.every((answer) => answer !== null);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-lg border border-primary/40 bg-primary/5 p-3"
    >
      <h3 id={headingId} className="flex items-center gap-2 text-sm font-semibold">
        <IconMessageQuestion aria-hidden className="size-4 text-primary-text" />
        {t('question.title', 'The assistant needs your answer')}
      </h3>
      {questions.map((question) => (
        <QuestionField
          key={question.question}
          question={question}
          draft={draftOf(question)}
          onChange={(draft) => setDrafts((current) => ({ ...current, [question.question]: draft }))}
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
