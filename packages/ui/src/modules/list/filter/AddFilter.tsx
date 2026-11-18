import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';
import { type ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Command } from '../../../components/command';
import { Popover } from '../../../components/popover';
import { Select } from '../../../components/select';
import { CONDITION_OPERATORS, NO_VALUE } from '../../conditions/conditions';
import {
  isFilled,
  opOf,
  operatorsFor,
  ruleFor,
  type TFilterOperator,
  type TFilterRule,
  withOperator,
} from '../../conditions/filterRule';
import { FieldPicker } from '../../conditions/FieldPicker';
import { FieldIcon } from '../../conditions/fieldIcons';
import { useOperatorLabel } from '../../conditions/filterText';
import { ValueEditor } from '../../conditions/ValueEditor';
import type { TListFilterField } from '../ListFilter';
import { type AddFrom, useListFilter } from './listFilterContext';
import { SearchBox } from './SearchChip';

const asOperator = (value: string): TFilterOperator | undefined =>
  value === 'between' ? 'between' : CONDITION_OPERATORS.find((op) => op === value);

/**
 * A new rule on `field`: its operator, then its value. The rule joins the filter once it says
 * enough (a pick, a typed value) and changes in place as editing goes on.
 */
const NewRule = ({ field, onDone }: { field: TListFilterField; onDone: () => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { lookups, parts, setPart } = useListFilter();
  const label = useOperatorLabel();
  const [rule, setRule] = useState<TFilterRule>(() => ruleFor(field));
  // Where the rule sits in the filter once it joins; only the handlers read it.
  const index = useRef<number | null>(null);
  const ops = operatorsFor(field);

  const change = (next: TFilterRule) => {
    setRule(next);

    if (isFilled(next)) {
      setPart(index.current, next);
      index.current ??= parts.length;
    } else if (index.current !== null) {
      setPart(index.current, null);
      index.current = null;
    }
  };

  const op = opOf(rule);

  return (
    <div className="flex flex-col">
      <div className="flex h-10 items-center gap-2 border-b px-3 text-sm">
        <FieldIcon field={field} className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">{field.label}</span>
        {ops.length > 1 && (
          <Select
            value={op}
            onValueChange={(next) => {
              const picked = asOperator(next);

              if (!picked) return;

              change(withOperator(rule, picked));

              if (NO_VALUE.has(picked)) onDone();
            }}
          >
            <Select.Trigger className="h-7 w-auto max-w-40" aria-label={t('operator', 'Operator')}>
              <Select.Value>{label(op, field.type)}</Select.Value>
            </Select.Trigger>
            <Select.Content>
              {ops.map((one) => (
                <Select.Item key={one} value={one}>
                  {label(one, field.type)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
      </div>
      <div className={field.type === 'number' || field.type === 'text' ? 'p-2' : undefined}>
        <ValueEditor
          key={op}
          rule={rule}
          field={field}
          lookups={lookups}
          onChange={change}
          onDone={onDone}
        />
      </div>
    </div>
  );
};

type View = { kind: 'fields' } | { kind: 'search' } | { kind: 'rule'; field: TListFilterField };

/** The picker's pages: the fields (with search and the advanced filter), then the chosen one. */
const AddFilterContent = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { fields, loading, error, setAdvancedOpen, setAdding } = useListFilter();
  const [view, setView] = useState<View>({ kind: 'fields' });
  const search = t('search', 'Search');
  const advanced = t('advanced', 'Advanced filter');

  if (view.kind === 'search') return <SearchBox onDone={onDone} />;

  if (view.kind === 'rule') return <NewRule field={view.field} onDone={onDone} />;

  return (
    <FieldPicker
      fields={fields}
      loading={loading}
      error={error}
      onSelect={(field) => {
        const found = fields.find((one) => one.path === field.path);

        if (found) setView({ kind: 'rule', field: found });
      }}
    >
      <Command.Group>
        <Command.Item
          value="search"
          keywords={[search]}
          onSelect={() => setView({ kind: 'search' })}
        >
          <IconSearch />
          {search}
        </Command.Item>
        <Command.Item
          value="advanced"
          keywords={[advanced]}
          onSelect={() => {
            setAdding(null);
            setAdvancedOpen(true);
          }}
        >
          <IconAdjustmentsHorizontal />
          {advanced}
        </Command.Item>
      </Command.Group>
    </FieldPicker>
  );
};

/**
 * "Add a filter": the fields to pick from, then the picked field's operator and value. It opens
 * from the view bar's filter button (`F`) or the filter row's "+ Filter".
 */
export const AddFilter = ({ from, trigger }: { from: AddFrom; trigger: ReactElement }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { adding, setAdding } = useListFilter();
  const open = adding === from;

  return (
    <Popover open={open} onOpenChange={(next) => setAdding(next ? from : null)}>
      <Popover.Trigger render={trigger} />
      <Popover.Content
        variant="flush"
        align={from === 'bar' ? 'end' : 'start'}
        className="w-72"
        aria-label={t('add-title', 'Add a filter')}
      >
        {open && <AddFilterContent onDone={() => setAdding(null)} />}
      </Popover.Content>
    </Popover>
  );
};
