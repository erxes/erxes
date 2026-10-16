import { useAiAgentRuntimePresets } from '@/automations/components/settings/components/agents/hooks/useAiAgentRuntimePresets';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Badge, cn, Skeleton } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';

const formatSeconds = (ms: number) => `${Math.round(ms / 1000)}s`;

export const AiAgentRuntimePresets = () => {
  const { control, setValue } = useFormContext<TAiAgentForm>();
  const runtime = useWatch({ control, name: 'runtime' });
  const { presets, activePreset, loading } = useAiAgentRuntimePresets(runtime);

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    );
  }

  if (!presets.length) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">Budget</h4>
        {!activePreset && <Badge variant="secondary">Custom</Badge>}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {presets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() =>
              setValue('runtime', preset.runtime, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className={cn(
              'rounded-lg border p-3 text-left transition-colors',
              activePreset?.key === preset.key
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'hover:bg-accent/40',
            )}
          >
            <span className="block text-sm font-medium">{preset.label}</span>
            <span className="block text-xs text-muted-foreground">
              {preset.description}
            </span>
            <span className="mt-2 block text-xs text-muted-foreground">
              {preset.runtime.maxTokens.toLocaleString()} tokens ·{' '}
              {formatSeconds(preset.runtime.timeoutMs)} timeout
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
