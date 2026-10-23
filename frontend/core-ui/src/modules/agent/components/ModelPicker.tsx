import { IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { IUseAgentsModelsResult } from '../hooks/useAgentsModels';
import { agentRecentModelsState } from '../states/agentRecentModelsState';
import { ProviderIcon } from './ProviderIcon';
import { getProviderLabel } from './ProviderPicker';

interface IModelChoice {
  provider: string;
  model: string;
}

export interface IModelPickerProps {
  models: IUseAgentsModelsResult;
  /** Selected `provider|model` value; '' means the saved workspace default. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoModel?: string;
  /** Actual saved connections, rather than guesses based on model names. */
  defaultModels?: IModelChoice[];
}

const VALUE_SEPARATOR = '|';
export const modelSelectionValue = (provider: string, model: string) =>
  provider && model ? `${provider}${VALUE_SEPARATOR}${model}` : '';
const choiceValue = (choice: IModelChoice) =>
  modelSelectionValue(choice.provider, choice.model);

/** Choose a provider first, then its shortlist or searchable model catalog. */
export const ModelPicker = ({
  models,
  value,
  onChange,
  disabled = false,
  autoModel,
  defaultModels = [],
}: IModelPickerProps) => {
  const [open, setOpen] = useState(false);
  const [browse, setBrowse] = useState(false);
  const [activeProvider, setActiveProvider] = useState('');
  const [search, setSearch] = useState('');
  const commandRef = useRef<HTMLDivElement>(null);
  const [recentModels, setRecentModels] = useAtom(agentRecentModelsState);
  const separatorIndex = value.indexOf(VALUE_SEPARATOR);
  const selectedProvider =
    separatorIndex === -1 ? '' : value.slice(0, separatorIndex);
  const selectedModel =
    separatorIndex === -1 ? '' : value.slice(separatorIndex + 1);
  const searching = search.trim().length > 0;
  const showCatalog = browse || searching;

  const catalog = useMemo(() => {
    const entries = new Map<string, IModelChoice>();
    for (const group of models.providerModels) {
      for (const model of group.models ?? []) {
        const choice = { provider: group.provider, model };
        entries.set(choiceValue(choice), choice);
      }
    }
    return entries;
  }, [models.providerModels]);

  // Current and recent selections stay close. Removed/unavailable models never
  // leak back into the choices from local storage or another connection.
  const quickPicks = Array.from(
    new Set([
      value,
      ...(Array.isArray(recentModels) ? recentModels : []),
      ...defaultModels.map(choiceValue),
    ]),
  )
    .flatMap((key) => {
      const choice = catalog.get(key);
      return choice?.provider === activeProvider ? [choice] : [];
    })
    .slice(0, 4);
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const choices = showCatalog
    ? Array.from(catalog.values()).filter((choice) => {
        const searchable = `${getProviderLabel(choice.provider)} ${
          choice.model
        }`.toLowerCase();
        return (
          choice.provider === activeProvider &&
          terms.every((term) => searchable.includes(term))
        );
      })
    : quickPicks;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setActiveProvider('');
      setBrowse(false);
      setSearch('');
    }
  };
  const select = (next: string) => {
    if (next)
      setRecentModels((previous) =>
        Array.from(
          new Set([
            next,
            ...(Array.isArray(previous)
              ? previous.filter((item) => typeof item === 'string')
              : []),
          ]),
        ).slice(0, 6),
      );
    onChange(next);
    setOpen(false);
  };

  const providers = Array.from(
    new Set([
      ...defaultModels.map((choice) => choice.provider),
      ...models.providerModels.map((group) => group.provider),
    ]),
  );
  const defaultProvider = defaultModels[0]?.provider;

  // With no provider search field, the command root owns keyboard navigation.
  useEffect(() => {
    if (open && !activeProvider) commandRef.current?.focus();
  }, [open, activeProvider]);

  const activeLabel = getProviderLabel(activeProvider);
  const navigateProvider = (provider: string) => {
    setActiveProvider(provider);
    setBrowse(false);
    setSearch('');
  };

  const renderChoice = (choice: IModelChoice) => (
    <Command.Item
      key={choiceValue(choice)}
      value={choiceValue(choice)}
      onSelect={() => select(choiceValue(choice))}
      className="h-10 gap-3 rounded-md px-3 text-[13px] data-[selected=true]:bg-muted"
    >
      <span className="min-w-0 flex-1 truncate" title={choice.model}>
        {choice.model}
      </span>
      {defaultModels.some(
        (saved) => choiceValue(saved) === choiceValue(choice),
      ) && (
        <span className="shrink-0 text-[11px] text-muted-foreground">
          Default
        </span>
      )}
      <Combobox.Check
        checked={value === choiceValue(choice)}
        className="shrink-0 text-foreground"
      />
    </Command.Item>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Combobox.Trigger
        variant="ghost"
        className="h-8 min-w-0 max-w-[200px] flex-1 justify-between rounded-md px-2 text-[13px]"
        disabled={disabled}
        aria-label="Model"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {(selectedProvider || defaultProvider) && (
            <ProviderIcon
              provider={selectedProvider || defaultProvider || ''}
              variant="plain"
              className="size-4 shrink-0"
            />
          )}
          <span className="truncate">
            {selectedModel || autoModel || 'Default model'}
          </span>
        </span>
      </Combobox.Trigger>
      <Combobox.Content
        className="w-80 min-w-0 max-w-[calc(100vw-24px)] overflow-hidden rounded-lg"
        collisionPadding={12}
        onOpenAutoFocus={(event) => {
          if (!activeProvider) {
            event.preventDefault();
            commandRef.current?.focus();
          }
        }}
        aria-label={
          activeProvider ? `${activeLabel} models` : 'Choose a provider'
        }
      >
        <Command
          ref={commandRef}
          key={activeProvider || 'providers'}
          label={activeProvider ? 'Search models' : 'Providers'}
          defaultValue={
            activeProvider
              ? quickPicks[0]
                ? choiceValue(quickPicks[0])
                : ''
              : selectedProvider || 'workspace-default'
          }
          shouldFilter={false}
        >
          {activeProvider ? (
            <>
              <div className="flex h-11 items-center justify-between gap-2 border-b px-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 rounded-md text-muted-foreground"
                    onClick={() => navigateProvider('')}
                    aria-label="Back to providers"
                  >
                    <IconArrowLeft className="size-4" />
                  </Button>
                  <span className="truncate text-[13px] font-medium">
                    {activeLabel}
                  </span>
                </div>
                {browse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs font-normal text-muted-foreground"
                    onClick={() => {
                      setBrowse(false);
                      setSearch('');
                    }}
                  >
                    Your models
                  </Button>
                )}
              </div>
              <Command.Input
                placeholder={`Find a ${activeLabel} model…`}
                aria-label="Search models"
                value={search}
                onValueChange={setSearch}
                variant="primary"
                className="h-10 text-[13px] font-normal placeholder:text-muted-foreground"
                wrapperClassName="px-4"
                focusOnMount
              />
            </>
          ) : (
            <div className="px-4 pb-1 pt-3 text-[11px] font-medium text-muted-foreground">
              Provider
            </div>
          )}
          <Command.List className="m-0 max-h-[min(320px,45vh)] p-1.5">
            {!activeProvider && (
              <>
                {providers.map((provider) => (
                  <Command.Item
                    key={provider}
                    value={provider}
                    onSelect={() => navigateProvider(provider)}
                    className="h-10 gap-3 rounded-md px-3 text-[13px] data-[selected=true]:bg-muted"
                  >
                    <ProviderIcon
                      provider={provider}
                      variant="plain"
                      className="size-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {getProviderLabel(provider)}
                    </span>
                    {selectedProvider === provider && (
                      <span className="text-[11px] text-muted-foreground">
                        In use
                      </span>
                    )}
                    <IconChevronRight
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Command.Item>
                ))}
                <Command.Separator className="mx-1 my-1.5" />
                <Command.Item
                  value="workspace-default"
                  onSelect={() => select('')}
                  className="h-10 gap-3 rounded-md px-3 text-xs text-muted-foreground data-[selected=true]:bg-muted"
                >
                  <span className="shrink-0">Use saved default</span>
                  {autoModel && (
                    <span
                      className="ml-auto truncate text-[11px]"
                      title={autoModel}
                    >
                      {autoModel}
                    </span>
                  )}
                  <Combobox.Check
                    checked={!value}
                    className="text-foreground"
                  />
                </Command.Item>
              </>
            )}
            {activeProvider && choices.length > 0 && (
              <Command.Group
                heading={showCatalog ? 'All models' : 'Your models'}
                className="p-0"
              >
                {choices.map(renderChoice)}
              </Command.Group>
            )}
            {models.loading && (
              <div
                role="status"
                className="flex items-center gap-2 px-3 py-4 text-xs text-muted-foreground"
              >
                <Spinner className="size-3.5" />
                Loading your models…
              </div>
            )}
            {!models.loading && models.error && (
              <p
                role="status"
                className="px-3 py-3 text-xs leading-5 text-muted-foreground"
              >
                Model list unavailable. Your saved default is still available.
              </p>
            )}
            {activeProvider &&
              searching &&
              choices.length === 0 &&
              !models.loading && (
                <div
                  role="status"
                  className="px-3 py-5 text-center text-xs text-muted-foreground"
                >
                  No matching models.
                </div>
              )}
            {activeProvider &&
              browse &&
              !searching &&
              choices.length === 0 &&
              !models.loading &&
              !models.error && (
                <p className="px-3 py-3 text-xs leading-5 text-muted-foreground">
                  No models are listed for this provider.
                </p>
              )}
            {activeProvider &&
              !showCatalog &&
              choices.length === 0 &&
              !models.loading && (
                <p className="px-3 py-3 text-xs leading-5 text-muted-foreground">
                  Search for a model, or browse this provider’s full list below.
                </p>
              )}
          </Command.List>
          {activeProvider && !showCatalog && (
            <div className="border-t p-1.5">
              <Button
                variant="ghost"
                className="h-8 w-full justify-between rounded-md px-3 text-xs font-normal text-muted-foreground"
                onClick={() => setBrowse(true)}
              >
                Browse all models <IconChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
