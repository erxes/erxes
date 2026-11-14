import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { templateStepRows } from '@/broadcast/utils/templateSteps';
import { Badge } from 'erxes-ui';
import { useMemo } from 'react';
import { TAutomationAction } from 'ui-modules';

export const BroadcastTemplateSteps = ({
  template,
  actions,
}: {
  template: TBuiltInTemplate;
  actions: TAutomationAction[];
}) => {
  const rows = useMemo(
    () => templateStepRows(template, actions),
    [template, actions],
  );

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key} className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
              {row.number}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {row.title}
            </span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {row.type}
            </Badge>
          </div>

          {row.values.length ? (
            <dl className="mt-2 space-y-1 border-t pt-2">
              {row.values.map((value) => (
                <div key={value.key} className="flex gap-2 text-xs">
                  <dt className="w-32 shrink-0 text-muted-foreground">
                    {value.label}
                  </dt>
                  <dd className="min-w-0 flex-1 truncate font-mono">
                    {value.text}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
              Nothing set yet — this step is configured after installing.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
