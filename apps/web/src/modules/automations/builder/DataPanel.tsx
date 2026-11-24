import type { AutomationStep } from '@erxes/core-contract';
import { IconChevronDown, IconVariable } from '@tabler/icons-react';
import { cn, Input } from 'erxes-ui';
import { type ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '@erxes/core-contract/client';
import { BuilderContext } from './BuilderContext';
import { type DataItem, type DataSource, useDataSources } from './dataSources';
import { DataTiles } from './DataTiles';
import { LINE } from './FlowNode';
import { LOOK, useStepLook } from './stepLook';
import { useReferenceFieldsError } from './useStepData';

const ICON_TILE = 'flex size-6 shrink-0 items-center justify-center rounded-md';

/** An earlier step's icon, as its card on the canvas shows it. */
const StepIcon = ({ step }: { step: AutomationStep }) => {
  const { knownActions } = useContext(BuilderContext);
  const { icon: Icon, tone } = useStepLook(step, knownActions);

  return (
    <span className={cn(ICON_TILE, tone)}>
      <Icon className="size-3.5" />
    </span>
  );
};

const TriggerIcon = () => {
  const Icon = LOOK.trigger.icon;

  return (
    <span className={cn(ICON_TILE, LOOK.trigger.tone)}>
      <Icon className="size-3.5" />
    </span>
  );
};

const matches = (item: DataItem, search: string) =>
  `${item.label} ${item.path}`.toLowerCase().includes(search.trim().toLowerCase());

/** The trigger or an earlier step, as a card that opens into the values it gives. */
const SourceCard = ({ source, search }: { source: DataSource; search: string }) => {
  const [open, setOpen] = useState(true);
  const searching = search.trim() !== '';

  const groups = source.groups
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(item, search)) }))
    .filter((group) => group.items.length);

  const count = groups.reduce(
    (sum, group) => sum + group.items.filter((item) => searching || !item.parent).length,
    0,
  );

  if (searching && !count) return null;

  return (
    <li className="relative overflow-hidden rounded-xl border bg-background shadow-xs">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent/50"
      >
        {source.step ? <StepIcon step={source.step} /> : <TriggerIcon />}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{source.label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
        <IconChevronDown
          className={cn('size-4 text-muted-foreground transition', !open && '-rotate-90')}
        />
      </button>
      {(open || searching) &&
        groups.map((group) => (
          <div key={group.title} className="border-t px-2 pt-2 pb-2">
            {group.title !== source.label && (
              <h4 className="px-1 pb-1.5 text-2xs font-medium text-muted-foreground">
                {group.title}
              </h4>
            )}
            <DataTiles items={group.items} searching={searching} />
          </div>
        ))}
    </li>
  );
};

/** The step being edited, at the end of the line: the data above flows into it. */
const ThisStep = ({ step }: { step: AutomationStep }) => {
  const { t } = useTranslation('automations');

  return (
    <li className="relative flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-background px-3 py-2">
      <StepIcon step={step} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        <StepTitle step={step} />
      </span>
      <span className="text-xs text-primary-text">{t('this-step', 'This step')}</span>
    </li>
  );
};

const StepTitle = ({ step }: { step: AutomationStep }) => {
  const { knownActions } = useContext(BuilderContext);
  const look = useStepLook(step, knownActions);

  return look.title || look.kind;
};

const Header = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('automations');

  return (
    <div className="shrink-0 space-y-3 border-b bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            LOOK.trigger.tone,
          )}
        >
          <IconVariable className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{t('data', 'Data')}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {t('data-help-short', 'Drag or click to insert')}
          </span>
        </span>
      </div>
      {children}
    </div>
  );
};

/**
 * Where a step's data comes from, as a small flow: the trigger and each earlier step as a card
 * of value tiles, joined by a line down to the step being edited.
 */
export const DataPanel = ({
  step,
  subject,
}: {
  step: AutomationStep;
  subject: 'customer' | 'company';
}) => {
  const { t } = useTranslation('automations');
  const sources = useDataSources(step, subject);
  const error = useReferenceFieldsError();
  const [search, setSearch] = useState('');

  return (
    <aside
      aria-label={t('data', 'Data')}
      className="flex w-80 shrink-0 flex-col border-l bg-sidebar"
    >
      <Header>
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('insert-data-search', 'Search data…')}
        />
      </Header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {error && (
          <p role="alert" className="mb-3 text-xs text-destructive-text">
            {messageOf(error)}
          </p>
        )}
        <ol className="relative space-y-3">
          <span className={cn('absolute top-4 bottom-4 left-6 w-px', LINE)} />
          {sources.map((source) => (
            <SourceCard key={source.id} source={source} search={search} />
          ))}
          <ThisStep step={step} />
        </ol>
      </div>
    </aside>
  );
};
