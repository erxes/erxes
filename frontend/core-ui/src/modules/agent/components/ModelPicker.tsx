import { IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  IAgentsModelOption,
  IUseAgentsModelsResult,
} from '../hooks/useAgentsModels';
import { agentRecentModelsState } from '../states/agentRecentModelsState';
import { ProviderIcon } from './ProviderIcon';
import { getProviderLabel } from './ProviderPicker';

interface IModelChoice {
  provider: string;
  model: string;
}

interface IModelGroup {
  heading: string;
  choices: IModelChoice[];
}

export interface IModelPickerProps {
  models: IUseAgentsModelsResult;
  /** Selected `provider|model` value; '' means the saved workspace default. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /**
   * Saved connections in server order. The first one is what an empty value
   * runs, so only it carries the Default marker.
   */
  savedModels?: IModelChoice[];
}

const VALUE_SEPARATOR = '|';
const RECENT_LIMIT = 3;
const FALLBACK_RECOMMENDED_LIMIT = 4;
export const modelSelectionValue = (provider: string, model: string) =>
  provider && model ? `${provider}${VALUE_SEPARATOR}${model}` : '';
const choiceValue = (choice: IModelChoice) =>
  modelSelectionValue(choice.provider, choice.model);
const describeChoice = (choice: IModelChoice) =>
  `${getProviderLabel(choice.provider)} · ${choice.model}`;

const rowClassName =
  'h-9 gap-3 rounded-md px-3 text-[13px] data-[selected=true]:bg-muted';

/** Choose a provider first, then its recommended models or full catalog. */
export const ModelPicker = ({
  models,
  value,
  onChange,
  disabled = false,
  savedModels = [],
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
  const serverDefault = savedModels[0];
  const defaultValue = serverDefault ? choiceValue(serverDefault) : '';
  const inUseProvider = selectedProvider || serverDefault?.provider || '';
  const searching = search.trim().length > 0;
  const showCatalog = browse || searching;

  const catalogs = useMemo(
    () =>
      new Map(models.providerModels.map((group) => [group.provider, group])),
    [models.providerModels],
  );
  const activeCatalog = catalogs.get(activeProvider);
  const activeModels: IAgentsModelOption[] = activeCatalog?.models ?? [];
  const toChoice = (model: IAgentsModelOption): IModelChoice => ({
    provider: activeProvider,
    model: model.id,
  });

  // Without a usable listing, the provider's saved model is still what the
  // server runs for it, so it stays selectable.
  const savedForProvider = savedModels.find(
    (choice) => choice.provider === activeProvider,
  );
  const catalogUnavailable =
    !models.loading && (!activeCatalog || Boolean(activeCatalog.error));

  const groups = ((): IModelGroup[] => {
    if (!activeProvider) return [];

    if (showCatalog) {
      const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const matches = activeModels.filter((model) => {
        const searchable = `${model.id} ${model.family}`.toLowerCase();
        return terms.every((term) => searchable.includes(term));
      });
      return [
        {
          heading: 'Recommended',
          choices: matches.filter((model) => model.recommended).map(toChoice),
        },
        {
          heading: 'Others',
          choices: matches.filter((model) => !model.recommended).map(toChoice),
        },
      ];
    }

    if (catalogUnavailable) {
      return savedForProvider
        ? [{ heading: 'Saved model', choices: [savedForProvider] }]
        : [];
    }

    const recommended = activeModels.some((model) => model.recommended)
      ? activeModels.filter((model) => model.recommended)
      : activeModels.slice(0, FALLBACK_RECOMMENDED_LIMIT);
    const recommendedIds = new Set(recommended.map((model) => model.id));
    const listedIds = new Set(activeModels.map((model) => model.id));
    // Current and recent selections stay close. Removed/unavailable models
    // never leak back into the choices from local storage.
    const recent = Array.from(
      new Set([value, ...(Array.isArray(recentModels) ? recentModels : [])]),
    )
      .flatMap((key) => {
        if (typeof key !== 'string') return [];
        const index = key.indexOf(VALUE_SEPARATOR);
        const provider = key.slice(0, index);
        const model = key.slice(index + 1);
        return index > 0 &&
          provider === activeProvider &&
          listedIds.has(model) &&
          !recommendedIds.has(model)
          ? [{ provider, model }]
          : [];
      })
      .slice(0, RECENT_LIMIT);

    return [
      { heading: 'Recent', choices: recent },
      { heading: 'Recommended', choices: recommended.map(toChoice) },
    ];
  })().filter((group) => group.choices.length > 0);

  const visibleValues = groups.flatMap((group) =>
    group.choices.map(choiceValue),
  );

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
      ...savedModels.map((choice) => choice.provider),
      ...models.providerModels.map((group) => group.provider),
    ]),
  );

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

  const renderChoice = (choice: IModelChoice) => {
    const key = choiceValue(choice);
    return (
      <Command.Item
        key={key}
        value={key}
        onSelect={() => select(key)}
        className={rowClassName}
      >
        <span className="min-w-0 flex-1 truncate" title={choice.model}>
          {choice.model}
        </span>
        {key === defaultValue && (
          <span className="shrink-0 text-[11px] text-muted-foreground">
            Default
          </span>
        )}
        <Combobox.Check
          checked={value === key}
          className="shrink-0 text-foreground"
        />
      </Command.Item>
    );
  };

  const triggerChoice = selectedModel
    ? { provider: selectedProvider, model: selectedModel }
    : serverDefault;
  const statusClassName = 'px-3 py-3 text-xs leading-5 text-muted-foreground';
  const providerStatus = (() => {
    if (!activeProvider) return null;
    if (models.loading && !activeCatalog) {
      return (
        <div
          role="status"
          className="flex items-center gap-2 px-3 py-4 text-xs text-muted-foreground"
        >
          <Spinner className="size-3.5" />
          Loading {activeLabel} models…
        </div>
      );
    }
    if (!activeCatalog) {
      return (
        <p role="status" className={statusClassName}>
          Model list unavailable. Your saved model is still available.
        </p>
      );
    }
    if (activeCatalog?.error) {
      return (
        <p role="status" className={statusClassName}>
          {activeCatalog.error}
        </p>
      );
    }
    if (searching && visibleValues.length === 0) {
      return (
        <div
          role="status"
          className="px-3 py-5 text-center text-xs text-muted-foreground"
        >
          No matching models.
        </div>
      );
    }
    if (activeCatalog && activeModels.length === 0) {
      return (
        <p role="status" className={statusClassName}>
          No usable chat models are listed for this provider.
        </p>
      );
    }
    return null;
  })();

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Combobox.Trigger
        variant="ghost"
        className="h-8 min-w-0 max-w-[200px] flex-1 justify-between rounded-md px-2 text-[13px]"
        disabled={disabled}
        aria-label="Model"
        title={
          triggerChoice
            ? `${describeChoice(triggerChoice)}${
                selectedModel ? '' : ' (saved default)'
              }`
            : undefined
        }
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {triggerChoice && (
            <ProviderIcon
              provider={triggerChoice.provider}
              variant="plain"
              className="size-4 shrink-0"
            />
          )}
          <span className="truncate">
            {triggerChoice?.model || 'Default model'}
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
              ? visibleValues.includes(value)
                ? value
                : visibleValues[0] ?? ''
              : inUseProvider || 'workspace-default'
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
                    Show less
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
                    {inUseProvider === provider ? (
                      <span className="text-[11px] text-muted-foreground">
                        In use
                      </span>
                    ) : (
                      catalogs.get(provider)?.error && (
                        <span className="text-[11px] text-muted-foreground">
                          Unavailable
                        </span>
                      )
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
                  {serverDefault && (
                    <span
                      className="ml-auto truncate text-[11px]"
                      title={describeChoice(serverDefault)}
                    >
                      {describeChoice(serverDefault)}
                    </span>
                  )}
                  <Combobox.Check
                    checked={!value}
                    className="text-foreground"
                  />
                </Command.Item>
                {models.loading && (
                  <div
                    role="status"
                    className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground"
                  >
                    <Spinner className="size-3.5" />
                    Loading your models…
                  </div>
                )}
                {!models.loading && models.error && (
                  <p role="status" className={statusClassName}>
                    Model list unavailable. Your saved default is still
                    available.
                  </p>
                )}
              </>
            )}
            {groups.map((group) => (
              <Command.Group
                key={group.heading}
                heading={group.heading}
                className="p-0 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:text-muted-foreground"
              >
                {group.choices.map(renderChoice)}
              </Command.Group>
            ))}
            {providerStatus}
          </Command.List>
          {activeProvider && !showCatalog && activeModels.length > 0 && (
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
