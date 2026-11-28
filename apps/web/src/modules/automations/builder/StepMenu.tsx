import type { AutomationStep } from '@erxes/core-contract';
import { IconArrowDown, IconArrowUp, IconCopy, IconDots, IconTrash } from '@tabler/icons-react';
import { Button, cn, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { cloneStep, insertStep, locate, moveStep, removeStep } from './flowModel';

export interface StepMenuProps {
  step: AutomationStep;
  steps: AutomationStep[];
  onSteps: (steps: AutomationStep[]) => void;
  onSelect: (id: string) => void;
  className?: string;
}

/** A step's "⋯": move it, duplicate it or remove it. On its card and in its panel. */
export const StepMenu = ({ step, steps, onSteps, onSelect, className }: StepMenuProps) => {
  const { t } = useTranslation('automations');
  const place = locate(steps, step.id);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        aria-label={t('step-actions', 'Step actions')}
        onClick={(event) => event.stopPropagation()}
        render={<Button variant="ghost" size="icon" className={cn('size-6', className)} />}
      >
        <IconDots className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-44">
        <DropdownMenu.Item
          disabled={!place || place.index === 0}
          onClick={() => onSteps(moveStep(steps, step.id, -1))}
        >
          <IconArrowUp />
          {t('move-up', 'Move up')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          disabled={!place || place.index === place.length - 1}
          onClick={() => onSteps(moveStep(steps, step.id, 1))}
        >
          <IconArrowDown />
          {t('move-down', 'Move down')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          disabled={!place}
          onClick={() => {
            if (!place) return;

            const copy = cloneStep(step);

            onSteps(insertStep(steps, place.address, place.index + 1, copy));
            onSelect(copy.id);
          }}
        >
          <IconCopy />
          {t('duplicate', 'Duplicate')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          variant="destructive"
          onClick={() => {
            onSteps(removeStep(steps, step.id));
            onSelect('trigger');
          }}
        >
          <IconTrash />
          {t('remove-step', 'Remove step')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
