import { useAiAgentRuntimePresetOptions } from '@/automations/components/settings/components/agents/hooks/useAiAgentRuntimeForm';
import { Badge, cn, Skeleton } from 'erxes-ui';

const SKELETON_KEYS = ['a', 'b', 'c'];

export const AiAgentRuntimePresets = () => {
  const { loading, isCustom, presetOptions } = useAiAgentRuntimePresetOptions();

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-20" />
        ))}
      </div>
    );
  }

  if (!presetOptions.length) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">Budget</h4>
        {isCustom && <Badge variant="secondary">Custom</Badge>}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {presetOptions.map(({ preset, isActive, limitsLabel, apply }) => (
          <button
            key={preset.key}
            type="button"
            onClick={apply}
            className={cn(
              'rounded-lg border p-3 text-left transition-colors',
              isActive
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'hover:bg-accent/40',
            )}
          >
            <span className="block text-sm font-medium">{preset.label}</span>
            <span className="block text-xs text-muted-foreground">
              {preset.description}
            </span>
            <span className="mt-2 block text-xs text-muted-foreground">
              {limitsLabel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
