import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { IconPlus, IconTrash, IconKey, IconCheck } from '@tabler/icons-react';
import { Button, Label, Input, Badge } from 'erxes-ui';
import {
  MASTRA_PROVIDERS,
  MASTRA_PROVIDER_PRESETS,
  MASTRA_PROVIDER_CATALOG,
} from '~/graphql/queries';
import {
  MASTRA_PROVIDER_SAVE,
  MASTRA_PROVIDER_REMOVE,
} from '~/graphql/mutations';

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

export const ProvidersPage = () => {
  const { data: providersData, refetch } = useQuery(MASTRA_PROVIDERS);
  const { data: presetsData } = useQuery(MASTRA_PROVIDER_PRESETS);
  const { data: catalogData } = useQuery(MASTRA_PROVIDER_CATALOG);
  const [saveProvider, { loading: saving }] = useMutation(
    MASTRA_PROVIDER_SAVE,
    {
      onCompleted: () => {
        refetch();
        setAdding(null);
      },
    },
  );
  const [removeProvider] = useMutation(MASTRA_PROVIDER_REMOVE, {
    onCompleted: () => refetch(),
  });

  // `adding` holds the provider key being added/edited, or '__custom__' for a custom entry
  const [adding, setAdding] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });

  const providers = providersData?.mastraProviders || [];
  const presets: any[] = presetsData?.mastraProviderPresets || [];
  // Maps provider key → isConfigured (covers both DB docs and env-var-only providers)
  const catalogMap = new Map<string, boolean>(
    (catalogData?.mastraProviderCatalog || []).map((p: any) => [
      p.provider,
      p.isConfigured,
    ]),
  );

  const handleAddPreset = (preset: any) => {
    setAdding(preset.provider);
    const existing = providers.find((p: any) => p.provider === preset.provider);
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
    setAdding('__custom__');
    setForm({ ...EMPTY_FORM });
  };

  const handleEdit = (p: any) => {
    setAdding(p.provider);
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

  const handleSave = () => {
    if (!adding) return;
    const providerKey = adding === '__custom__' ? form.provider : adding;
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

  const handleRemove = (p: any) => {
    if (window.confirm(`Remove provider "${p.label || p.provider}"?`)) {
      removeProvider({ variables: { _id: p._id } });
    }
  };

  const editingLabel =
    adding === '__custom__'
      ? 'Custom Provider'
      : presets.find((c: any) => c.provider === adding)?.label || adding;

  const isEdit =
    adding &&
    providers.some(
      (p: any) =>
        p.provider === (adding === '__custom__' ? form.provider : adding),
    );

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
            {providers.map((p: any) => (
              <div
                key={p._id}
                className="rounded-lg border bg-card p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {p.label || p.provider}
                    </span>
                    {p.isDefault && <Badge>Default</Badge>}
                    {!p.isEnabled && (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                    {p.isOpenAICompatible && (
                      <Badge variant="secondary" className="text-xs">
                        OpenAI-compatible
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                    <IconKey size={12} />
                    <span className="font-mono">
                      {p.apiKey
                        ? '••••••' + p.apiKey.slice(-4)
                        : p.envKey
                          ? `env: ${p.envKey}`
                          : 'No key'}
                    </span>
                    {p.baseUrl && (
                      <span className="ml-2 text-xs">· {p.baseUrl}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(p)}
                  >
                    <IconTrash className="text-destructive" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add / Edit provider form */}
      {adding && (
        <section className="rounded-lg border bg-card p-5 space-y-4">
          <h3 className="font-semibold">
            {isEdit ? 'Edit' : 'Add'} {editingLabel}
          </h3>

          {/* Custom provider name input */}
          {adding === '__custom__' && (
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
              Environment variable name for the API key (used when no DB key is
              stored).
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
              request. Required for gated endpoints — e.g. Kimi For Coding only
              serves recognized coding agents, so it needs a{' '}
              <code>User-Agent</code> like{' '}
              <code>claude-cli/1.0.65 (external, cli)</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="providerOpenAI"
              checked={form.isOpenAICompatible}
              onChange={(e) =>
                setForm((f) => ({ ...f, isOpenAICompatible: e.target.checked }))
              }
            />
            <Label htmlFor="providerOpenAI">OpenAI-compatible API</Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="providerDefault"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDefault: e.target.checked }))
              }
            />
            <Label htmlFor="providerDefault">Set as default provider</Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="providerEnabled"
              checked={form.isEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, isEnabled: e.target.checked }))
              }
            />
            <Label htmlFor="providerEnabled">Enabled</Label>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              <IconCheck size={16} /> {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setAdding(null)}>
              Cancel
            </Button>
          </div>
        </section>
      )}

      {/* Available presets */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          {providers.length > 0 ? 'Add Another Provider' : 'Select a Provider'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((preset: any) => {
            const configured = providers.some(
              (p: any) => p.provider === preset.provider,
            );
            const envOnly =
              !configured && catalogMap.get(preset.provider) === true;
            return (
              <div
                key={preset.provider}
                className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                  adding === preset.provider
                    ? 'border-primary bg-primary/5'
                    : envOnly
                      ? 'border-green-500/40 hover:border-green-500/70'
                      : 'border-border hover:border-primary/50'
                }`}
                role="button"
                tabIndex={0}
                onClick={() => handleAddPreset(preset)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAddPreset(preset);
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
                  {preset.isOpenAICompatible ? 'OpenAI-compatible' : 'Native'} ·
                  models listed live from the provider
                </p>
              </div>
            );
          })}

          {/* Custom provider tile */}
          <div
            className={`rounded-lg border border-dashed p-4 cursor-pointer transition-colors ${
              adding === '__custom__'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
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
    </div>
  );
};
