import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { type ComponentType, type ReactNode, useState } from 'react';
import { Combobox } from 'erxes-ui/components/combobox';
import { Form } from 'erxes-ui/components/form';
import { Popover } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import { Filter } from 'erxes-ui/modules/filter/components/Filter';
import { useFilterContext } from 'erxes-ui/modules/filter/hooks/useFilterContext';
import { PopoverScoped } from 'erxes-ui/modules/hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';
import {
  idsOf,
  type ListState,
  type PickerLook,
  type PickerMode,
  type PickerProps,
  type PickerTexts,
  PickerListView,
  PickerValueView,
} from './selectFamily';

/** What a picker family is made of; `P` is its props for reading records. */
export interface PickerFamilySpec<P, T> extends PickerLook<T> {
  icon: ComponentType<{ className?: string }>;
  /** The records with these ids, to show the picked ones. */
  useById: (props: P, ids: string[]) => { byId: Map<string, T>; loading: boolean };
  /** The records to pick from for `search`. */
  useList: (props: P, search: string) => ListState<T>;
  useTexts: () => PickerTexts;
}

/** A family's value and list, which its cells, fields and filter parts put in their popovers. */
interface Parts<Q> {
  Value: ComponentType<Q>;
  Content: ComponentType<Q & { onPick?: () => void }>;
}

/** The picked records in a table cell; a click opens the list. */
const PickerInlineCell = <Q extends PickerProps>({
  parts,
  picker,
  scope,
}: {
  parts: Parts<Q>;
  picker: Q;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
      <RecordTableInlineCell.Trigger>
        <parts.Value {...picker} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="min-w-72">
        <parts.Content {...picker} onPick={() => setOpen(false)} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** A picker button; in a form (`inForm`, inside `Form.Item`) it is the field's control. */
const PickerField = <Q extends PickerProps>({
  parts,
  picker,
  className,
  inForm,
}: {
  parts: Parts<Q>;
  picker: Q;
  className?: string;
  inForm?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const trigger = (
    <Combobox.Trigger className={cn('w-full', className)}>
      <parts.Value {...picker} />
    </Combobox.Trigger>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {inForm ? <Form.Control>{trigger}</Form.Control> : trigger}
      <Combobox.Content>
        <parts.Content {...picker} onPick={() => setOpen(false)} />
      </Combobox.Content>
    </Popover>
  );
};

/**
 * `filterKey` in the address: the id, or the ids comma-separated (`multiple`). A page reads
 * it with nuqs' `parseAsString` or `parseAsArrayOf(parseAsString)`.
 */
const useFilterIds = (filterKey: string) => useQueryState(filterKey, parseAsArrayOf(parseAsString));

/** The ids to keep in the address: none clears the filter. */
const toAddress = (value: string | string[] | undefined) => {
  const ids = idsOf(value);

  return ids.length ? ids : null;
};

interface FilterProps {
  filterKey: string;
  mode?: PickerMode;
}

/** The picker as the filter popover's view of `filterKey`; a pick closes the popover. */
const PickerFilterView = <P,>({
  parts,
  source,
}: {
  parts: Parts<P & PickerProps>;
  source: P & FilterProps;
}) => {
  const { filterKey, mode = 'single' } = source;
  const [ids, setIds] = useFilterIds(filterKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <parts.Content
        {...source}
        mode={mode}
        value={mode === 'single' ? ids?.[0] : (ids ?? [])}
        onValueChange={(next) => {
          void setIds(toAddress(next));
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

/** The filter's chip on the bar while `filterKey` is set: its name, then the picked records. */
const PickerFilterBar = <P,>({
  parts,
  source,
  icon: Icon,
  label,
}: {
  parts: Parts<P & PickerProps>;
  source: P & FilterProps;
  icon: ComponentType<{ className?: string }>;
  label: ReactNode;
}) => {
  const { filterKey, mode = 'multiple' } = source;
  const [ids, setIds] = useFilterIds(filterKey);
  const [open, setOpen] = useState(false);

  if (!ids?.length) return null;

  const value = mode === 'single' ? ids[0] : ids;

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <Icon />
        {label}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger render={<Filter.BarButton filterKey={filterKey} />}>
          <parts.Value {...source} value={value} mode={mode} />
        </Popover.Trigger>
        <Combobox.Content>
          <parts.Content
            {...source}
            mode={mode}
            value={value}
            onValueChange={(next) => {
              void setIds(toAddress(next));
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

/** Builds the parts of a picker family from how it reads its records. */
export const pickerFamily = <P extends object, T>(spec: PickerFamilySpec<P, T>) => {
  const Value = (props: P & PickerProps) => {
    const texts = spec.useTexts();
    const { byId, loading } = spec.useById(props, idsOf(props.value));

    return <PickerValueView {...props} look={spec} texts={texts} byId={byId} loading={loading} />;
  };

  const Content = (props: P & PickerProps & { onPick?: () => void }) => {
    const [search, setSearch] = useState('');
    const texts = spec.useTexts();
    const { byId } = spec.useById(props, idsOf(props.value));
    const list = spec.useList(props, search.trim());

    return (
      <PickerListView
        {...props}
        look={spec}
        texts={texts}
        byId={byId}
        list={list}
        search={search}
        onSearchChange={setSearch}
      />
    );
  };

  const parts: Parts<P & PickerProps> = { Value, Content };

  return {
    /** The searchable list alone, for a popover of the page's own. */
    Content,
    /** The picked records as a trigger shows them. */
    Value,
    InlineCell: (props: P & PickerProps & { scope?: string }) => (
      <PickerInlineCell parts={parts} picker={props} scope={props.scope} />
    ),
    /** A picker button inside `Form.Item`, as the field's control. */
    FormItem: (props: P & PickerProps & { className?: string }) => (
      <PickerField parts={parts} picker={props} className={props.className} inForm />
    ),
    /** A picker button of its own, outside a form. */
    Field: (props: P & PickerProps & { className?: string }) => (
      <PickerField parts={parts} picker={props} className={props.className} />
    ),
    /** The filter popover's row that opens this picker's view. */
    FilterItem: ({ value, label }: { value: string; label: ReactNode }) => (
      <Filter.Item value={value}>
        <spec.icon />
        {label}
      </Filter.Item>
    ),
    FilterView: (props: P & FilterProps) => <PickerFilterView parts={parts} source={props} />,
    FilterBar: (props: P & FilterProps & { label: ReactNode }) => (
      <PickerFilterBar parts={parts} source={props} icon={spec.icon} label={props.label} />
    ),
  };
};
