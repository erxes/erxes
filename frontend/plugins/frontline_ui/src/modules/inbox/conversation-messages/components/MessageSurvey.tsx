import { cn } from 'erxes-ui';
import { IMessageSurvey, IMessageSurveyStep } from '@/inbox/types/Conversation';

const timeLeftLabel = (expiry?: string): string => {
  if (!expiry) return '';
  const ms = new Date(expiry).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return 'Survey closed';
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d left`;
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
};

const votesLabel = (count: number) =>
  `${count} ${count === 1 ? 'vote' : 'votes'}`;

const getSteps = (survey: IMessageSurvey): IMessageSurveyStep[] =>
  survey.steps?.length
    ? survey.steps
    : [
        {
          stepId: survey.surveyId || 'survey',
          question: survey.question,
          answers: survey.answers,
          allowMultiselect: survey.allowMultiselect,
        },
      ];

const SurveyStep = ({
  step,
  countById,
}: {
  step: IMessageSurveyStep;
  countById: Map<string | number, number>;
}) => {
  const stepVotes = step.answers.reduce(
    (sum, answer) => sum + (countById.get(answer.id) ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-sm font-semibold">{step.question || 'Survey'}</div>
      {step.description && (
        <div className="text-xs text-muted-foreground">{step.description}</div>
      )}
      <div className="text-xs text-muted-foreground">
        {step.allowMultiselect
          ? 'Select multiple answers'
          : 'Select one answer'}
      </div>
      {step.answers.map((answer) => {
        const count = countById.get(answer.id) ?? 0;
        const pct = stepVotes > 0 ? Math.round((count / stepVotes) * 100) : 0;

        return (
          <div
            key={answer.id}
            className="relative overflow-hidden rounded border bg-accent/40 px-3 py-2"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/15"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between gap-2 text-sm">
              <span className="truncate">
                {answer.emoji ? `${answer.emoji} ` : ''}
                {answer.text}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {votesLabel(count)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const MessageSurvey = ({ survey }: { survey: IMessageSurvey }) => {
  const countById = new Map<string | number, number>(
    (survey.results?.answerCounts ?? []).map((c) => [c.id, c.count]),
  );
  const totalVotes = [...countById.values()].reduce((sum, n) => sum + n, 0);
  const steps = getSteps(survey);

  const closed =
    Boolean(survey.results?.isFinalized) ||
    (survey.expiry ? new Date(survey.expiry).getTime() <= Date.now() : false);
  const status = closed ? 'Survey closed' : timeLeftLabel(survey.expiry);

  return (
    <div className="mt-2 w-full rounded-lg border bg-background p-3">
      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div key={step.stepId} className="flex flex-col gap-1.5">
            {steps.length > 1 && (
              <div className="text-xs font-mono uppercase text-muted-foreground">
                {step.name || `Step ${index + 1}`}
              </div>
            )}
            <SurveyStep step={step} countById={countById} />
          </div>
        ))}
      </div>

      <div className={cn('mt-2 text-xs text-muted-foreground')}>
        {votesLabel(totalVotes)}
        {status && ` • ${status}`}
      </div>
    </div>
  );
};
