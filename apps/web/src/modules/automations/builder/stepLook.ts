import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import {
  IconArrowsSplit,
  IconBolt,
  IconBrain,
  IconClock,
  IconGitBranch,
  IconHandStop,
  IconHourglass,
  IconRoute,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { catalogIcon } from './catalogGroups';
import { STEP_TITLES, type StepType } from './flowModel';
import { useStepText } from './useStepText';

export type NodeIcon = ComponentType<{ className?: string }>;

const GREEN = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
const AMBER = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
const VIOLET = 'bg-violet-500/10 text-violet-600 dark:text-violet-400';

/** How each kind of node looks: icon, tile colour and the dot by its kind's name. */
export const LOOK: Record<StepType | 'trigger', { icon: NodeIcon; tone: string; dot: string }> = {
  trigger: { icon: IconBolt, tone: GREEN, dot: 'bg-emerald-500' },
  action: { icon: IconBolt, tone: 'bg-primary/10 text-primary-text', dot: 'bg-primary' },
  delay: { icon: IconClock, tone: AMBER, dot: 'bg-amber-500' },
  wait_for: { icon: IconHourglass, tone: AMBER, dot: 'bg-amber-500' },
  branch: { icon: IconGitBranch, tone: VIOLET, dot: 'bg-violet-500' },
  switch: { icon: IconRoute, tone: VIOLET, dot: 'bg-violet-500' },
  split: { icon: IconArrowsSplit, tone: VIOLET, dot: 'bg-violet-500' },
  decide: { icon: IconBrain, tone: VIOLET, dot: 'bg-violet-500' },
  stop: { icon: IconHandStop, tone: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

/** A step as its card shows it: its kind, icon (the action's own), colours, title and detail. */
export const useStepLook = (step: AutomationStep, actions: ActionInfo[]) => {
  const { t } = useTranslation('automations');
  const text = useStepText(step) ?? { title: '', detail: null };

  const action =
    step.type === 'action' ? actions.find((item) => item.type === step.action) : undefined;

  return {
    ...LOOK[step.type],
    ...text,
    kind:
      step.type === 'action'
        ? t('step-kind-action', 'Do this')
        : t(`step-type.${step.type}`, STEP_TITLES[step.type]),
    icon: action ? catalogIcon(action) : LOOK[step.type].icon,
  };
};
