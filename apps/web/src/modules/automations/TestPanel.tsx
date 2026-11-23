import type {
  Automation,
  AutomationDefinition,
  AutomationStep,
  coreContract,
  DryRunStep,
} from '@erxes/core-contract';
import type { InferContractRouterOutputs } from '@orpc/contract';
import { IconAlertTriangle, IconFlask } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Badge, Button, Label, RelativeDateDisplay, Spinner, Switch } from 'erxes-ui';
import { useContext, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { ContactSelect } from '~/modules/contacts/components/ContactPicker';
import { BuilderContext } from './builder/BuilderContext';
import { armsOf, findStep } from './builder/flowModel';
import { describeStep } from './builder/flowText';
import { JsonView } from './builder/JsonView';
import { useAutomationFields } from './builder/useAutomationFields';

type TestResult = InferContractRouterOutputs<typeof coreContract>['automations']['test'];

const TraceStep = ({
  item,
  hookAutomationId,
  steps,
}: {
  item: DryRunStep;
  hookAutomationId?: string;
  steps: AutomationStep[];
}) => {
  const { knownActions, events } = useContext(BuilderContext);
  const { fields } = useAutomationFields(null, hookAutomationId);
  const step = findStep(steps, item.stepId);

  const title = step
    ? describeStep(step, { actions: knownActions, events, fields }).title
    : item.type;

  return (
    <li className="space-y-1.5 rounded-md border p-2.5 text-sm">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
        <Badge variant={item.problem ? 'destructive' : 'secondary'}>{item.outcome}</Badge>
      </div>
      {item.problem && <p className="text-xs text-destructive-text">{item.problem}</p>}
      {item.input !== null && item.input !== undefined && <JsonView value={item.input} />}
    </li>
  );
};

const Trace = ({
  result,
  hookAutomationId,
  steps,
}: {
  result: TestResult;
  hookAutomationId?: string;
  steps: AutomationStep[];
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-2">
      {result.problems.length > 0 && (
        <Alert variant="destructive">
          <IconAlertTriangle />
          <Alert.Title>{t('test-problems', 'Fix before saving or turning on')}</Alert.Title>
          <Alert.Description>
            <ul className="space-y-1 text-destructive-text">
              {result.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </Alert.Description>
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Badge variant={result.triggerMatches ? 'success' : 'warning'}>
          {result.triggerMatches
            ? t('trigger-matches', 'The trigger’s conditions hold')
            : t('trigger-not', 'The trigger’s conditions don’t hold')}
        </Badge>
        {result.goalMetAtStart && (
          <Badge variant="info">{t('goal-already', 'Goal already met')}</Badge>
        )}
      </div>
      <ol className="space-y-2">
        {result.trace.map((item) => (
          <TraceStep
            key={item.stepId}
            item={item}
            hookAutomationId={hookAutomationId}
            steps={steps}
          />
        ))}
      </ol>
    </div>
  );
};

const waitsForEvents = (steps: AutomationStep[]): boolean =>
  steps.some(
    (step) => step.type === 'wait_for' || armsOf(step).some((arm) => waitsForEvents(arm.steps)),
  );

const SampleLine = ({ sample }: { sample: Automation['hookSample'] }) => {
  const { t } = useTranslation('automations');

  return (
    <p className="text-sm">
      {sample ? (
        <>
          {t('test-with-sample', 'With the sample call from')}{' '}
          <RelativeDateDisplay value={sample.at}>
            <RelativeDateDisplay.Value value={sample.at} />
          </RelativeDateDisplay>
        </>
      ) : (
        t(
          'test-needs-sample',
          'Send a sample call to the address first, or paste one on the trigger.',
        )
      )}
    </p>
  );
};

const RecordPick = ({
  subject,
  value,
  onChange,
}: {
  subject: 'customer' | 'company';
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}) => {
  const { t } = useTranslation('automations');
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {subject === 'customer' ? t('test-customer', 'Customer') : t('test-company', 'Company')}
      </Label>
      <ContactSelect
        kind={subject}
        id={id}
        value={value}
        onValueChange={onChange}
        noneLabel={t('pick-record', 'Pick one')}
      />
    </div>
  );
};

export const TestPanel = ({
  automation,
  definition,
  subject,
  dirty,
}: {
  automation: Automation;
  definition: AutomationDefinition;
  subject: 'customer' | 'company' | null;
  dirty: boolean;
}) => {
  const { t } = useTranslation('automations');
  const id = useId();
  const [recordId, setRecordId] = useState<string>();
  const [assume, setAssume] = useState(false);
  const canManage = useCan()('automations.manage');
  const sendDraft = dirty && canManage;
  const activeDefinition = sendDraft ? definition : automation.definition;
  const run = useMutation(orpc.automations.test.mutationOptions());
  const webhook = activeDefinition.trigger.kind === 'webhook';
  const sample = automation.hookSample;
  const blocked = (webhook && !sample) || (!webhook && subject !== null && !recordId);

  const test = () => {
    run.mutate({
      id: automation.id,
      ...(sendDraft ? { definition } : {}),
      ...(webhook && sample
        ? { payload: { method: 'POST', body: sample.body, query: sample.query } }
        : {}),
      ...(!webhook && subject && recordId ? { subjectType: subject, subjectId: recordId } : {}),
      assumeEventHappens: assume,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t(
          'test-description',
          'Shows what each step would do, unsaved changes included. Nothing is sent or changed.',
        )}
      </p>
      {webhook ? (
        <SampleLine sample={sample} />
      ) : (
        subject && <RecordPick subject={subject} value={recordId} onChange={setRecordId} />
      )}
      {waitsForEvents(activeDefinition.steps) && (
        <div className="flex items-center gap-2 text-sm">
          <Switch id={`${id}-assume`} checked={assume} onCheckedChange={setAssume} />
          <Label htmlFor={`${id}-assume`} variant="option">
            {t('assume-event', 'Waits for events: assume the event happens')}
          </Label>
        </div>
      )}
      <Button className="w-full" disabled={run.isPending || blocked} onClick={test}>
        {run.isPending ? <Spinner size="sm" /> : <IconFlask />}
        {t('run-test', 'Run the test')}
      </Button>
      {run.isError && <p className="text-sm text-destructive-text">{messageOf(run.error)}</p>}
      {run.data && (
        <Trace
          result={run.data}
          hookAutomationId={webhook ? automation.id : undefined}
          steps={activeDefinition.steps}
        />
      )}
    </div>
  );
};
