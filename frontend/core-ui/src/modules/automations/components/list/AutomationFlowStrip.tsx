import {
  buildFlowPreview,
  TFlowPreviewNode,
} from '@/automations/utils/flowPreview';
import { IconChevronRight } from '@tabler/icons-react';
import { cn, IconComponent } from 'erxes-ui';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TAutomationAction, TAutomationTrigger } from 'ui-modules';

const FALLBACK_ICON: Record<TFlowPreviewNode['kind'], string> = {
  trigger: 'IconBolt',
  action: 'IconChevronRight',
};

const FlowChip = ({ node }: { node: TFlowPreviewNode }) => {
  const label = node.label || node.type;

  return (
    <span
      title={label}
      className={cn(
        'flex min-w-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs',
        node.kind === 'trigger'
          ? 'border-primary/20 bg-primary/5 text-primary'
          : 'border-border bg-background text-foreground',
      )}
    >
      <IconComponent
        name={node.icon || FALLBACK_ICON[node.kind]}
        className="size-3 shrink-0"
      />
      <span className="truncate">{label}</span>
    </span>
  );
};

export const AutomationFlowStrip = ({
  triggers,
  actions,
  entryActionId,
  className,
}: {
  triggers?: TAutomationTrigger[];
  actions?: TAutomationAction[];
  entryActionId?: string;
  className?: string;
}) => {
  const { t } = useTranslation('automations');
  const { rows, remainingCount } = useMemo(
    () => buildFlowPreview(triggers, actions, entryActionId),
    [triggers, actions, entryActionId],
  );

  if (!rows.length) {
    return (
      <div className={cn('text-xs text-muted-foreground', className)}>
        {t('flow-preview-empty')}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {rows.map((row, rowIndex) => (
        <div
          key={row[0]?.id || rowIndex}
          className="flex min-w-0 items-center gap-1"
        >
          {row.map((node, nodeIndex) => (
            <Fragment key={node.id}>
              {nodeIndex > 0 && (
                <IconChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
              )}
              <FlowChip node={node} />
            </Fragment>
          ))}
          {rowIndex === rows.length - 1 && remainingCount > 0 && (
            <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
              +{remainingCount}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
