import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { IconPlus, IconTrash, IconKey, IconCheck } from '@tabler/icons-react';
import { Button, Label, Input, Badge, Sheet, Switch } from 'erxes-ui';
import {
  MASTRA_PROVIDERS,
  MASTRA_PROVIDER_PRESETS,
  MASTRA_PROVIDER_CATALOG,
} from '~/graphql/queries';
import {
  MASTRA_PROVIDER_SAVE,
  MASTRA_PROVIDER_REMOVE,
} from '~/graphql/mutations';

interface MastraProvider {
  _id: string;
  provider: string;
  label?: string;
  apiKey?: string;
  baseUrl?: string;
  modelsEndpoint?: string;
  isOpenAICompatible?: boolean;
  envKey?: string;
  headers?: Record<string, string> | null;
  isDefault?: boolean;
  isEnabled?: boolean;
}

const EMPTY_FORM = {
  provider: '',
  apiKey: '',
  baseUrl: '',
  modelsEndpoint: '',
  isOpenAICompatible: false,
  envKey: '',
  // Custom headers edited as one `Header-Name: value` per line.
  headersText: '',
  isDefault: false,
  isEnabled: true,
};

// Serialize a { name: value } header map into editable `Name: value` lines.
const serializeHeaders = (h?: Record<string, string> | null): string =>
  h
    ? Object.entries(h)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    : '';

// Parse `Name: value` lines back into a header map (blank lines ignored).
const parseHeaders = (text: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const line of (text || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
};

// A single configured-provider row with edit/remove actions.
const ConfiguredProviderCard = ({
  provider: p,
  onEdit,
  onRemove,
}: {
  provider: MastraProvider;
  onEdit: (p: MastraProvider) => void;
  onRemove: (p: MastraProvider) => void;
}) => {
  const keyHint = p.apiKey
    ? '••••••' + p.apiKey.slice(-4)
    : p.envKey
      ? `env: ${p.envKey}`
      : 'No key';

  return (
    <div className="rounded-lg border bg-card p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{p.label || p.provider}</span>
          {p.isDefault && <Badge>Default</Badge>}
          {!p.isEnabled && <Badge variant="secondary">Disabled</Badge>}
          {p.isOpenAICompatible && (
            <Badge variant="secondary" className="text-xs">
              OpenAI-compatible
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
          <IconKey size={12} />
          <span className="font-mono">{keyHint}</span>
          {p.baseUrl && <span className="ml-2 text-xs">· {p.baseUrl}</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
          Edit
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemove(p)}>
          <IconTrash className="text-destructive" size={16} />
        </Button>
      </div>
    </div>
  );
};

// A selectable preset tile in the "add provider" grid.
const PresetTile = ({
  preset,
  configured,
  envOnly,
  onSelect,
}: {
  preset: any;
  configured: boolean;
  envOnly: boolean;
  onSelect: () => void;
}) => (
  <div
    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
      envOnly
        ? 'border-green-500/40 hover:border-green-500/70'
        : 'border-border hover:border-primary/50'
    }`}
    role="button"
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    }}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="font-semibold text-sm">{preset.label}</span>
      {configured ? (
        <Badge variant="secondary" className="text-xs">
          <IconCheck size={10} className="mr-1" /> Configured
        </Badge>
      ) : envOnly ? (
        <Badge variant="success" className="text-xs">
          Via env
        </Badge>
      ) : null}
    </div>
    <p className="text-xs text-muted-foreground">
      {preset.isOpenAICompatible ? 'OpenAI-compatible' : 'Native'} · models
      listed live from the provider
    </p>
  </div>
);

export const ProvidersPage = () => {
  const { data: providersData, refetch } = useQuery(MASTRA_PROVIDERS);
  const { data: presetsData } = useQuery(MASTRA_PROVIDER_PRESETS);
  const { data: catalogData } = useQuery(MASTRA_PROVIDER_CATALOG);

  // `editing` holds the provider key being added/edited, or '__custom__' for a custom entry
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });

  const [saveProvider, { loading: saving }] = useMutation(
    MASTRA_PROVIDER_SAVE,
    {
      onCompleted: () => {
        refetch();
        setEditing(null);
      },
    },
  );
  const [removeProvider] = useMutation(MASTRA_PROVIDER_REMOVE, {
    onCompleted: () => refetch(),
  });

  const providers: MastraProvider[] = providersData?.mastraProviders || [];
  const presets: any[] = presetsData?.mastraProviderPresets || [];
  // Maps provider key → isConfigured (covers both DB docs and env-var-only providers)
  const catalogMap = new Map<string, boolean>(
    (catalogData?.mastraProviderCatalog || []).map((p: any) => [
      p.provider,
      p.isConfigured,
    ]),
  );

  const handleAddPreset = (preset: any) => {
    setEditing(preset.provider);
    const existing = providers.find((p) => p.provider === preset.provider);
    setForm({
      provider: preset.provider,
      apiKey: existing?.apiKey || '',
      baseUrl: existing?.baseUrl || preset.baseUrl || '',
      modelsEndpoint: existing?.modelsEndpoint || preset.modelsEndpoint || '',
      isOpenAICompatible:
        existing?.isOpenAICompatible ?? preset.isOpenAICompatible ?? false,
      envKey: existing?.envKey || preset.envKey || '',
      headersText: serializeHeaders(existing?.headers || preset.headers),
      isDefault: existing?.isDefault || false,
      isEnabled: existing?.isEnabled ?? true,
    });
  };

  const handleAddCustom = () => {
    setEditing('__custom__');
    setForm({ ...EMPTY_FORM });
  };

  const handleEdit = (p: MastraProvider) => {
    setEditing(p.provider);
    setForm({
      provider: p.provider,
      apiKey: p.apiKey || '',
      baseUrl: p.baseUrl || '',
      modelsEndpoint: p.modelsEndpoint || '',
      isOpenAICompatible: p.isOpenAICompatible ?? false,
      envKey: p.envKey || '',
      headersText: serializeHeaders(p.headers),
      isDefault: p.isDefault || false,
      isEnabled: p.isEnabled ?? true,
    });
  };

  const providerKey =
    editing === '__custom__' ? form.provider.trim() : editing || '';
  const canSave = Boolean(providerKey) && !saving;

  const handleSave = () => {
    if (!providerKey) return;

    const preset = presets.find((c: any) => c.provider === providerKey);
    saveProvider({
      variables: {
        doc: {
          provider: providerKey,
          label: preset?.label || providerKey,
          apiKey: form.apiKey,
          baseUrl: form.baseUrl,
          modelsEndpoint: form.modelsEndpoint,
          isOpenAICompatible: form.isOpenAICompatible,
          envKey: form.envKey,
          headers: parseHeaders(form.headersText),
          isDefault: form.isDefault,
          isEnabled: form.isEnabled,
        },
      },
    });
  };

  const handleRemove = (p: MastraProvider) => {
    if (window.confirm(`Remove provider "${p.label || p.provider}"?`)) {
      removeProvider({ variables: { _id: p._id } });
    }
  };

  const editingLabel =
    editing === '__custom__'
      ? 'Custom Provider'
      : presets.find((c: any) => c.provider === editing)?.label || editing;

  const isEdit = editing && providers.some((p) => p.provider === providerKey);

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Providers &amp; Models</h1>
        <p className="text-muted-foreground mt-1">
          Configure API keys for LLM providers. Keys are stored in the database
          and injected at agent runtime.
        </p>
      </div>

      {/* Configured providers */}
      {providers.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Configured Providers</h2>
          <div className="space-y-3">
            {providers.map((p) => (
              <ConfiguredProviderCard
                key={p._id}
                provider={p}
                onEdit={handleEdit}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available presets */}
      <section>
        <h2 className="text-lg font-semibold mb-1">
          {providers.length > 0 ? 'Add Another Provider' : 'Select a Provider'}
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Click a provider to configure it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((preset: any) => {
            const configured = providers.some(
              (p) => p.provider === preset.provider,
            );
            const envOnly =
              !configured && catalogMap.get(preset.provider) === true;
            return (
              <PresetTile
                key={preset.provider}
                preset={preset}
                configured={configured}
                envOnly={envOnly}
                onSelect={() => handleAddPreset(preset)}
              />
            );
          })}

          {/* Custom provider tile */}
          <div
            className="rounded-lg border border-dashed border-border p-4 cursor-pointer transition-colors hover:border-primary/50"
            role="button"
            tabIndex={0}
            onClick={handleAddCustom}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <IconPlus size={14} />
              <span className="font-semibold text-sm">Custom Provider</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Add any OpenAI-compatible or native provider not listed above.
            </p>
          </div>
        </div>
      </section>

      {/* Add / Edit provider sheet */}
      <Sheet
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <Sheet.View className="sm:max-w-lg p-0 flex flex-col">
          <Sheet.Header>
            <Sheet.Title>
              {isEdit ? 'Edit' : 'Add'} {editingLabel}
            </Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>

          <Sheet.Content className="overflow-y-auto p-5 space-y-4">
            {/* Custom provider name input */}
            {editing === '__custom__' && (
              <div className="space-y-1.5">
                <Label>Provider Key *</Label>
                <Input
                  value={form.provider}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, provider: e.target.value }))
                  }
                  placeholder="e.g. my-custom-llm"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier. Use kebab-case, no spaces.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>API Key</Label>
              <Input
                type="password"
                value={form.apiKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apiKey: e.target.value }))
                }
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Base URL</Label>
              <Input
                value={form.baseUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, baseUrl: e.target.value }))
                }
                placeholder="https://api.example.com/v1"
              />
              <p className="text-xs text-muted-foreground">
                Required for OpenAI-compatible providers. Leave empty for native
                providers.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Models Endpoint</Label>
              <Input
                value={form.modelsEndpoint}
                onChange={(e) =>
                  setForm((f) => ({ ...f, modelsEndpoint: e.target.value }))
                }
                placeholder="https://api.example.com/v1/models"
              />
              <p className="text-xs text-muted-foreground">
                Optional URL to dynamically fetch the list of available models.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Env Key</Label>
              <Input
                value={form.envKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, envKey: e.target.value }))
                }
                placeholder="MY_PROVIDER_API_KEY"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Environment variable name for the API key (used when no DB key
                is stored).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Custom Headers</Label>
              <textarea
                value={form.headersText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, headersText: e.target.value }))
                }
                placeholder={'User-Agent: claude-cli/1.0.65 (external, cli)'}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                One <code>Header-Name: value</code> per line, sent with every
                request. Required for gated endpoints — e.g. Kimi For Coding
                only serves recognized coding agents, so it needs a{' '}
                <code>User-Agent</code> like{' '}
                <code>claude-cli/1.0.65 (external, cli)</code>.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="providerOpenAI">OpenAI-compatible API</Label>
                  <p className="text-xs text-muted-foreground">
                    Provider implements the OpenAI chat completions API.
                  </p>
                </div>
                <Switch
                  id="providerOpenAI"
                  checked={form.isOpenAICompatible}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({
                      ...f,
                      isOpenAICompatible: Boolean(checked),
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="providerDefault">Default provider</Label>
                  <p className="text-xs text-muted-foreground">
                    Used when an agent doesn&apos;t specify a provider.
                  </p>
                </div>
                <Switch
                  id="providerDefault"
                  checked={form.isDefault}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isDefault: Boolean(checked) }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="providerEnabled">Enabled</Label>
                  <p className="text-xs text-muted-foreground">
                    Disabled providers are hidden from model selection.
                  </p>
                </div>
                <Switch
                  id="providerEnabled"
                  checked={form.isEnabled}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isEnabled: Boolean(checked) }))
                  }
                />
              </div>
            </div>
          </Sheet.Content>

          <Sheet.Footer>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              <IconCheck size={16} />{' '}
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Provider'}
            </Button>
          </Sheet.Footer>
        </Sheet.View>
      </Sheet>
    </div>
  );
};
