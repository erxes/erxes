import { TemplateRequirementField } from '@/template/components/wizard/TemplateRequirementField';
import { TemplateStepSummary } from '@/template/components/wizard/TemplateStepSummary';
import { useTemplateStepRow } from '@/template/hooks/useTemplateStepRow';
import { TTemplateRequirement } from '@/template/types';
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconLock,
} from '@tabler/icons-react';
import { Badge, Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * A step as one row: collapsed it says what was chosen, expanded it asks.
 * The body grows and shrinks in place instead of swapping pages.
 */
export const TemplateStepRow = ({
  requirement,
  index,
}: {
  requirement: TTemplateRequirement;
  index: number;
}) => {
  const { t } = useTranslation('templates');
  const row = useTemplateStepRow(requirement, index);
  const isLocked = !row.isOpen;

  return (
    <div
      ref={row.rowRef}
      className={cn(
        'scroll-mb-24 rounded-xl border bg-background transition-[box-shadow,border-color] duration-200 lg:scroll-mb-5',
        row.isExpanded && 'border-primary/40 shadow-md ring-4 ring-primary/5',
        isLocked && 'opacity-60',
      )}
    >
      <button
        type="button"
        disabled={isLocked}
        aria-expanded={row.isExpanded}
        onClick={row.toggle}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
      >
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors',
            row.isDone && 'bg-success/15 text-success',
            !row.isDone && !isLocked && 'border-2 border-primary text-primary',
            isLocked && 'bg-muted text-muted-foreground',
          )}
        >
          {row.isDone ? (
            <IconCheck className="size-4" />
          ) : isLocked ? (
            <IconLock className="size-3.5" />
          ) : (
            index + 1
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-medium">{requirement.label}</span>
          {!row.isExpanded && (
            <span className="flex min-w-0 text-xs text-muted-foreground">
              {/* A default is already an answer, even before its turn */}
              {isLocked && !row.isDone ? (
                t('locked')
              ) : (
                <TemplateStepSummary
                  requirement={requirement}
                  value={row.value}
                  label={row.label}
                />
              )}
            </span>
          )}
        </span>

        {row.isDefault && !row.isExpanded && (
          <Badge
            variant="secondary"
            className="h-5 shrink-0 border-transparent px-1.5 text-[11px] font-normal text-muted-foreground"
          >
            {t('default')}
          </Badge>
        )}
        {!isLocked && (
          <IconChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
              row.isExpanded && 'rotate-180',
            )}
          />
        )}
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          row.isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div ref={row.bodyRef} className="min-h-0 overflow-hidden">
          {!isLocked && (
            <div
              className="flex flex-col gap-4 border-t p-4"
              onKeyDown={row.onKeyDown}
            >
              {requirement.description && (
                <p className="text-sm text-muted-foreground">
                  {requirement.description}
                </p>
              )}
              <TemplateRequirementField
                requirement={requirement}
                value={row.value}
                dependsOnValue={row.dependsOnValue}
                onChange={row.onChange}
                onLabel={row.onLabel}
              />
              <div className="flex items-center justify-end gap-3">
                {row.enterHint && (
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {t(row.enterHint)}
                  </span>
                )}
                <Button disabled={!row.isDone} onClick={row.onContinue}>
                  {t('continue')}
                  <IconArrowRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
