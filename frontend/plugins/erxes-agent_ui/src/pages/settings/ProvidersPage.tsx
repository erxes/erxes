import { useState } from 'react';
import { IconPlus, IconTrash, IconKey, IconCheck } from '@tabler/icons-react';
import { Badge, Button, cn, useConfirm } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProviders } from './hooks/useProviders';
import { ProviderForm } from './components/ProviderForm';
import { IMastraProvider, IMastraProviderPreset } from './types';
import {
  PROVIDER_FORM_DEFAULTS,
  ProviderFormValues,
  providerFormSchema,
} from './validations';
import { parseHeaders, serializeHeaders } from './utils';

const CUSTOM_KEY = '__custom__';

export const ProvidersPage = () => {
  // `adding` holds the provider key being added/edited, or '__custom__' for a custom entry
  const [adding, setAdding] = useState<string | null>(null);
  const { confirm } = useConfirm();

  const {
    providers,
    presets,
    catalogMap,
    saveProvider,
    removeProvider,
    saving,
  } = useProviders(() => setAdding(null));

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: PROVIDER_FORM_DEFAULTS,
  });

  const handleAddPreset = (preset: IMastraProviderPreset) => {
    setAdding(preset.provider);
    const existing = providers.find((p) => p.provider === preset.provider);
    form.reset({
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
    setAdding(CUSTOM_KEY);
    form.reset({ ...PROVIDER_FORM_DEFAULTS });
  };

  const handleEdit = (p: IMastraProvider) => {
    setAdding(p.provider);
    form.reset({
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

  const handleSave = (values: ProviderFormValues) => {
    if (!adding) return;
    const providerKey = adding === CUSTOM_KEY ? values.provider : adding;
    if (!providerKey) return;

    const preset = presets.find((c) => c.provider === providerKey);
    saveProvider({
      variables: {
        doc: {
          provider: providerKey,
          label: preset?.label || providerKey,
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
          modelsEndpoint: values.modelsEndpoint,
          isOpenAICompatible: values.isOpenAICompatible,
          envKey: values.envKey,
          headers: parseHeaders(values.headersText),
          isDefault: values.isDefault,
          isEnabled: values.isEnabled,
        },
      },
    });
  };

  const handleRemove = (p: IMastraProvider) =>
    confirm({
      message: `Remove provider "${p.label || p.provider}"?`,
      options: { okLabel: 'Remove', cancelLabel: 'Cancel' },
    }).then(() => removeProvider({ variables: { _id: p._id } }));

  const formProvider = form.watch('provider');
  // Single model of what's being edited: nothing, a custom entry (keyed by the
  // typed provider field), or a preset (keyed by `adding`).
  const target =
    adding == null
      ? null
      : adding === CUSTOM_KEY
        ? { kind: 'custom' as const, key: formProvider }
        : { kind: 'preset' as const, key: adding };

  const editingLabel =
    target?.kind === 'custom'
      ? 'Custom Provider'
      : presets.find((c) => c.provider === target?.key)?.label ||
        target?.key ||
        '';

  const isEdit = Boolean(
    target && providers.some((p) => p.provider === target.key),
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Providers &amp; Models</h1>
          <p className="text-muted-foreground mt-1">
            Configure API keys for LLM providers. Keys are stored in the
            database and injected at agent runtime.
          </p>
        </div>

        {providers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Configured Providers</h2>
            <div className="space-y-3">
              {providers.map((p) => (
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

        {adding && (
          <section>
            <ProviderForm
              form={form}
              title={editingLabel}
              isEdit={isEdit}
              isCustom={adding === CUSTOM_KEY}
              saving={saving}
              onSubmit={handleSave}
              onCancel={() => setAdding(null)}
            />
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3">
            {providers.length > 0
              ? 'Add Another Provider'
              : 'Select a Provider'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => {
              const configured = providers.some(
                (p) => p.provider === preset.provider,
              );
              const envOnly =
                !configured && catalogMap.get(preset.provider) === true;
              return (
                <div
                  key={preset.provider}
                  className={cn(
                    'rounded-lg border p-4 cursor-pointer transition-colors',
                    adding === preset.provider
                      ? 'border-primary bg-primary/5'
                      : envOnly
                        ? 'border-green-500/40 hover:border-green-500/70'
                        : 'border-border hover:border-primary/50',
                  )}
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
                    <span className="font-semibold text-sm">
                      {preset.label}
                    </span>
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
                    {preset.isOpenAICompatible ? 'OpenAI-compatible' : 'Native'}{' '}
                    · models listed live from the provider
                  </p>
                </div>
              );
            })}

            <div
              className={cn(
                'rounded-lg border border-dashed p-4 cursor-pointer transition-colors',
                adding === CUSTOM_KEY
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              )}
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
    </div>
  );
};
