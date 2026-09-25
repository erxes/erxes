import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { Badge } from 'erxes-ui';
import { TAutomationAction } from 'ui-modules';

const MAX_VALUE_LENGTH = 140;

const readable = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

/** `toEmailsPlaceHolders` reads as "To emails place holders". */
const spellOut = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (first) => first.toUpperCase())
    .trim();

/**
 * What a step is actually set to, spelled out.
 *
 * Empty fields are left out: a template leaves them for the organization to
 * write, and listing them here as blanks would say nothing. Everything else is
 * shown as it will be installed — including the `{{ }}` placeholders, which
 * are the part worth reading before agreeing to the flow.
 */
const configuredValues = (config?: Record<string, unknown>) =>
  Object.entries(config || {}).filter(([, value]) => {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }

    return true;
  });

export const BroadcastTemplateSteps = ({
  template,
  actions,
}: {
  template: TBuiltInTemplate;
  actions: TAutomationAction[];
}) => (
  <div className="space-y-3">
    {actions.map((action, index) => {
      const values = configuredValues(action.config);
      const step = template.flow[index];

      return (
        <div key={action.id} className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {action.label || step?.label || action.type}
            </span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {action.type}
            </Badge>
          </div>

          {values.length ? (
            <dl className="mt-2 space-y-1 border-t pt-2">
              {values.map(([key, value]) => {
                const text = readable(value);

                return (
                  <div key={key} className="flex gap-2 text-xs">
                    <dt className="w-32 shrink-0 text-muted-foreground">
                      {spellOut(key)}
                    </dt>
                    <dd className="min-w-0 flex-1 truncate font-mono">
                      {text.length > MAX_VALUE_LENGTH
                        ? `${text.slice(0, MAX_VALUE_LENGTH)}…`
                        : text}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
              Nothing set yet — this step is configured after installing.
            </p>
          )}
        </div>
      );
    })}
  </div>
);
