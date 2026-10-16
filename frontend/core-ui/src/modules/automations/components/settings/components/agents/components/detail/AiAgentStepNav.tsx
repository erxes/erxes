import {
  AI_AGENT_STEP_META,
  AI_AGENT_STEPS,
  TAiAgentStepStatus,
} from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import {
  IconAlertTriangle,
  IconBulb,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleX,
  IconLoader2,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';

const STATUS_META: Record<
  TAiAgentStepStatus,
  { label: string; icon: typeof IconBulb; className: string }
> = {
  done: { label: 'Done', icon: IconCircleCheck, className: 'text-success' },
  hint: { label: 'Hint', icon: IconBulb, className: 'text-muted-foreground' },
  warning: {
    label: 'Check',
    icon: IconAlertTriangle,
    className: 'text-warning',
  },
  error: { label: 'Error', icon: IconCircleX, className: 'text-destructive' },
  missing: {
    label: 'Missing',
    icon: IconCircleDashed,
    className: 'text-muted-foreground',
  },
  pending: {
    label: 'Checking',
    icon: IconLoader2,
    className: 'text-muted-foreground [&>svg]:animate-spin',
  },
};

export const AiAgentStepNav = () => {
  const { step: activeStep, setStep, states } = useAiAgentDetailContext();

  return (
    <nav
      className="grid shrink-0 grid-cols-5 gap-2 px-5 pt-4"
      aria-label="Agent setup steps"
    >
      {AI_AGENT_STEPS.map((step) => {
        const { label, icon: Icon } = AI_AGENT_STEP_META[step];
        const status = STATUS_META[states[step].status];
        const StatusIcon = status.icon;
        const isActive = step === activeStep;

        return (
          <button
            key={step}
            type="button"
            onClick={() => setStep(step)}
            aria-current={isActive ? 'step' : undefined}
            className={cn(
              'flex min-w-0 flex-col items-center gap-0.5 rounded-lg border px-1 py-2 text-xs transition-colors sm:px-2',
              isActive
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'hover:bg-accent/40',
            )}
          >
            <Icon className="size-4" />
            <span className="w-full truncate text-center text-xs font-medium sm:text-sm">
              {label}
            </span>
            <span
              className={cn(
                'hidden items-center gap-1 sm:flex',
                status.className,
              )}
            >
              <StatusIcon className="size-3.5" />
              {status.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
