import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import {
  CoreTemplateRequirement,
  isCoreTemplateRequirement,
} from '@/automations/components/builder/template/CoreTemplateRequirement';
import { TBuiltInTemplateRequirement } from '@/automations/utils/builtInTemplates';
import { IconCheck, IconPointFilled } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { splitAutomationNodeType } from 'ui-modules';
import { useTranslation } from 'react-i18next';

/**
 * One thing the tenant must already have for a template to work.
 *
 * The component that answers it belongs to the plugin that owns the thing:
 * only frontline knows what a Facebook bot is, how to list the ones this
 * organization has, and where you go to connect another. It reports its answer
 * upward, and a requirement with no answer is what keeps Install closed —
 * there is no separate readiness protocol.
 */
export const BroadcastTemplateRequirement = ({
  requirement,
  value,
  dependsOnValue,
  disabled,
  onChange,
}: {
  requirement: TBuiltInTemplateRequirement;
  value: unknown;
  dependsOnValue: unknown;
  disabled: boolean;
  onChange: (value: unknown | null) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const [pluginName, moduleName] = splitAutomationNodeType(requirement.kind);
  const isAnswered = value !== undefined && value !== null;
  const isCoreKind = isCoreTemplateRequirement(requirement.kind);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3',
        isAnswered && 'border-success/40 bg-success/5',
        disabled && 'opacity-50',
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
          isAnswered
            ? 'border-success bg-success text-success-foreground'
            : 'text-muted-foreground',
        )}
      >
        {isAnswered ? (
          <IconCheck className="size-3" />
        ) : (
          <IconPointFilled className="size-2" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium leading-none">
            {requirement.label}
          </p>
          {requirement.description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {requirement.description}
            </p>
          )}
        </div>

        {isCoreKind && !disabled && (
          <CoreTemplateRequirement
            kind={requirement.kind}
            value={value}
            onChange={onChange}
          />
        )}

        {!isCoreKind && !disabled && (
          <RenderPluginsComponentWrapper
            pluginName={pluginName}
            moduleName={moduleName}
            props={{
              componentType: 'templateRequirement',
              kind: requirement.kind,
              value,
              dependsOnValue,
              onChange,
            }}
          />
        )}

        {disabled && (
          <p className="text-xs text-muted-foreground">
            {t('workflow.answer-above')}
          </p>
        )}
      </div>
    </div>
  );
};
