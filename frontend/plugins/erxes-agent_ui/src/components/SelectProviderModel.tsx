import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Button, Combobox, Command, Input, Popover, Spinner } from 'erxes-ui';
import {
  MASTRA_PROVIDERS,
  MASTRA_PROVIDER_CATALOG,
  MASTRA_PROVIDER_MODELS,
} from '~/graphql/queries';

// ─── Reusable provider / model pickers ───────────────────────────────────────
//
// Built on the standard erxes-ui Combobox + Command (searchable popover)
// pattern used across the app. Any form that needs an AI provider/model pair
// (agent form, workflow steps, settings…) should use these instead of
// hand-rolling selects.
//
// Model lists are never written in code: SelectModel queries
// mastraProviderModels, which asks the selected provider's live model-listing
// API what is available right now. When the endpoint yields nothing (or the
// saved model isn't in the list) the picker falls back to manual id entry.

export interface ProviderOption {
  provider: string;
  label: string;
}

// Providers offered for selection: configured presets (DB doc or env key)
// plus any custom DB providers outside the presets catalog.
export const useProviderOptions = () => {
  const { data: catalogData, loading: catalogLoading } = useQuery(
    MASTRA_PROVIDER_CATALOG,
  );
  const { data: providersData, loading: providersLoading } =
    useQuery(MASTRA_PROVIDERS);

  const catalogConfigured: ProviderOption[] = (
    catalogData?.mastraProviderCatalog || []
  )
    .filter((p: any) => p.isConfigured)
    .map((p: any) => ({ provider: p.provider, label: p.label }));
  const catalogKeys = new Set(catalogConfigured.map((p) => p.provider));
  const customDbProviders: ProviderOption[] = (
    providersData?.mastraProviders || []
  )
    .filter((p: any) => p.isEnabled && !catalogKeys.has(p.provider))
    .map((p: any) => ({ provider: p.provider, label: p.label || p.provider }));

  return {
    providers: [...catalogConfigured, ...customDbProviders],
    loading: catalogLoading || providersLoading,
  };
};

export const SelectProvider = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange: (provider: string) => void;
  disabled?: boolean;
}) => {
  const { providers, loading } = useProviderOptions();
  const [open, setOpen] = useState(false);
  const selected = providers.find((p) => p.provider === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="h-9" disabled={disabled}>
        <Combobox.Value
          value={selected?.label ?? value ?? ''}
          placeholder="Select provider…"
          loading={loading && !providers.length && !!value}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search providers…" />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {providers.map((p) => (
              <Command.Item
                key={p.provider}
                value={`${p.label} ${p.provider}`}
                onSelect={() => {
                  onValueChange(p.provider);
                  setOpen(false);
                }}
              >
                {p.label}
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  {p.provider}
                </span>
                <Combobox.Check checked={p.provider === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const SelectModel = ({
  provider,
  value,
  onValueChange,
  disabled,
}: {
  /** Provider key whose live model catalog to offer. */
  provider: string;
  value: string;
  onValueChange: (model: string) => void;
  disabled?: boolean;
}) => {
  // Live list from the provider's own model-listing API (via the backend).
  // cache-and-network: an earlier empty/failed fetch must not stick — every
  // mount re-asks the provider while still painting cached data instantly.
  const { data, loading } = useQuery(MASTRA_PROVIDER_MODELS, {
    variables: { provider },
    skip: !provider,
    fetchPolicy: 'cache-and-network',
  });
  const models: { id: string; name: string }[] =
    data?.mastraProviderModels ?? [];

  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);

  // Manual mode is per-provider state: switching providers clears the model
  // value, so always land back on the preset dropdown — otherwise a stale
  // `custom` from the previous provider forces the manual input and the user
  // has to click "Presets" before they can pick anything.
  useEffect(() => {
    setCustom(false);
  }, [provider]);

  // A saved model the live catalog doesn't list is a manual entry — show the
  // input so the value stays visible and editable.
  useEffect(() => {
    if (loading || !provider || !value) return;
    if (models.length > 0 && !models.some((m) => m.id === value))
      setCustom(true);
  }, [loading, provider, value, models]);

  if (custom) {
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="e.g. meta/llama-3.1-8b-instruct"
          className="font-mono text-sm flex-1"
          required
        />
        {models.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setCustom(false);
              onValueChange('');
            }}
          >
            Presets
          </Button>
        )}
      </div>
    );
  }

  const selected = models.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="h-9" disabled={disabled || !provider}>
        <Combobox.Value
          value={selected ? selected.name : value || ''}
          placeholder={!provider ? 'Select a provider first' : 'Select model…'}
          loading={!!provider && loading && !!value && !models.length}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search models…" />
          <Command.List>
            {/* Explicit rows — Command.Empty never fires here because the
                manual-entry item below keeps the list non-empty. */}
            {loading && (
              <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
                <Spinner
                  className="size-4"
                  containerClassName="w-auto flex-none"
                />
                Fetching models from the provider…
              </div>
            )}
            {!loading && models.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">
                The provider returned no models. Check its API key and models
                endpoint, or enter a model ID manually.
              </p>
            )}
            {!loading &&
              models.map((m) => (
                <Command.Item
                  key={m.id}
                  value={`${m.name} ${m.id}`}
                  onSelect={() => {
                    onValueChange(m.id);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">
                    {m.name !== m.id ? (
                      <>
                        {m.name}
                        <span className="ml-2 text-xs text-muted-foreground font-mono">
                          ({m.id})
                        </span>
                      </>
                    ) : (
                      <span className="font-mono text-sm">{m.id}</span>
                    )}
                  </span>
                  <Combobox.Check checked={m.id === value} />
                </Command.Item>
              ))}
            <Command.Separator />
            <Command.Item
              value="__custom__"
              onSelect={() => {
                setCustom(true);
                onValueChange('');
                setOpen(false);
              }}
            >
              <span className="text-muted-foreground italic">
                Enter model ID manually…
              </span>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
