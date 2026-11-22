import type { Automation } from '@erxes/core-contract';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Badge, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { countSteps } from './builder/flowChecks';
import type { Selection } from './StepInspector';

type Item = {
  key: string;
  title: string;
  detail: string;
  done: boolean;
  select: Selection;
};

const useItems = ({
  automation,
  trigger,
  problemCount,
  tested,
}: {
  automation: Pick<Automation, 'definition' | 'hookSample'>;
  trigger: string;
  problemCount: number;
  tested: boolean;
}): Item[] => {
  const { t } = useTranslation('automations');
  const { definition, hookSample } = automation;
  const { trigger: start } = definition;
  const hooked = start.kind === 'webhook';
  const subject = start.kind === 'webhook' ? start.subject : undefined;
  const steps = countSteps(definition.steps);

  return [
    {
      key: 'starts',
      title: t('setup-starts', 'Starts'),
      detail: trigger,
      done: true,
      select: 'trigger',
    },
    ...(hooked
      ? [
          {
            key: 'sample',
            title: t('setup-sample', 'Sample call'),
            detail: hookSample
              ? t('setup-sample-got', 'Got one')
              : t('setup-sample-waiting', 'Waiting for a call'),
            done: Boolean(hookSample),
            select: 'trigger',
          },
          {
            key: 'subject',
            title: t('setup-subject', 'Who it’s about'),
            detail: subject
              ? subject.type === 'company'
                ? t('test-company', 'Company')
                : t('test-customer', 'Customer')
              : t('setup-optional', 'Optional'),
            done: Boolean(subject),
            select: 'trigger',
          },
        ]
      : []),
    {
      key: 'steps',
      title: t('setup-steps', 'Steps'),
      detail: steps
        ? problemCount
          ? t('problem-count', '{{count}} to fix', { count: problemCount })
          : t('step-count', '{{count}} steps', { count: steps })
        : t('setup-steps-none', 'Add one with + on the canvas'),
      done: steps > 0 && problemCount === 0,
      select: definition.steps[0]?.id ?? 'trigger',
    },
    {
      key: 'test',
      title: t('setup-test', 'Test'),
      detail: tested
        ? t('setup-tested', 'Tested')
        : t('setup-test-hint', 'See what each step would do'),
      done: tested,
      select: 'test',
    },
  ];
};

export const SetupRail = ({
  automation,
  trigger,
  problemCount,
  tested,
  selected,
  onSelect,
  onTurnOn,
  onHide,
}: {
  automation: Pick<Automation, 'definition' | 'hookSample'>;
  trigger: string;
  problemCount: number;
  tested: boolean;
  selected: Selection;
  onSelect: (selection: Selection) => void;
  onTurnOn: (() => void) | undefined;
  onHide: () => void;
}) => {
  const { t } = useTranslation('automations');
  const items = useItems({ automation, trigger, problemCount, tested });

  return (
    <nav
      aria-label={t('setup', 'Set up')}
      className="flex w-56 shrink-0 flex-col gap-1 border-r bg-background p-3"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{t('setup', 'Set up')}</span>
        <Button
          variant="ghost"
          size="icon"
          tone="muted"
          className="size-6"
          aria-label={t('setup-hide', 'Hide')}
          onClick={onHide}
        >
          <IconX />
        </Button>
      </div>
      <ol className="space-y-0.5">
        {items.map((item, index) => (
          <li key={item.key}>
            <Button
              variant={selected === item.select ? 'secondary' : 'ghost'}
              aria-current={selected === item.select ? 'step' : undefined}
              className="h-auto w-full justify-start"
              onClick={() => onSelect(item.select)}
            >
              <Badge variant={item.done ? 'success' : 'muted'} size="sm">
                {item.done ? <IconCheck /> : index + 1}
              </Badge>
              <span className="min-w-0 text-left">
                <span className="block">{item.title}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {item.detail}
                </span>
              </span>
            </Button>
          </li>
        ))}
      </ol>
      <Button className="mt-2" disabled={!onTurnOn} onClick={onTurnOn}>
        {t('activate', 'Turn on')}
      </Button>
      {problemCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('fix-first', 'Fix the marked steps first')}
        </p>
      )}
    </nav>
  );
};
