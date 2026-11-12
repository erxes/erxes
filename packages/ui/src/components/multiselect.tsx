import { IconX } from '@tabler/icons-react';
import { Command } from 'erxes-ui/components/command';
import { cn } from 'erxes-ui/lib/utils';
import * as React from 'react';
import { withoutPicked } from './multiselect-options';
import { CreatableItem, MultiSelectEmpty, OptionGroups, SelectedBadge } from './multiselect-parts';
import {
  useMultipleSelector,
  type MultipleSelectorProps,
  type MultipleSelectorRef,
  type MultipleSelectorState,
} from './multiselect-state';

export type { MultiSelectOption } from './multiselect-options';

type PartProps = { props: MultipleSelectorProps; state: MultipleSelectorState };

const SelectorInput = ({ props, state }: PartProps) => {
  const { inputProps, hidePlaceholderWhenSelected } = props;
  const { selected, inputRef } = state;

  return (
    <Command.Input
      {...inputProps}
      ref={inputRef}
      value={state.inputValue}
      disabled={props.disabled}
      onValueChange={(next) => {
        state.setInputValue(next);
        inputProps?.onValueChange?.(next);
      }}
      onBlur={(event) => {
        if (!state.onScrollbar) state.setOpen(false);

        inputProps?.onBlur?.(event);
      }}
      onFocus={(event) => {
        state.setOpen(true);
        inputProps?.onFocus?.(event);
      }}
      placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : props.placeholder}
      className={cn(
        'flex-1 h-7 w-full bg-transparent outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed',
        {
          'w-full': hidePlaceholderWhenSelected,
          'px-3 py-2': selected.length === 0,
          'ml-1': selected.length !== 0,
        },
        inputProps?.className,
      )}
      wrapperClassName="min-w-0 flex-1 basis-32 border-none rounded-lg overflow-hidden"
    />
  );
};

/** The selected badges, the input and the clear-all button. */
const SelectorField = ({ props, state }: PartProps) => {
  const { disabled } = props;
  const { selected } = state;
  const fixed = selected.filter((item) => item.fixed);

  return (
    <div
      // Pressing the field's padding focuses the input; keyboard users tab to it.
      role="presentation"
      className={cn(
        'relative min-h-7 rounded shadow-xs transition-[color,box-shadow] text-sm focus-within:outline-hidden focus-within:shadow-focus has-disabled:cursor-not-allowed has-disabled:opacity-50',
        { 'p-1': selected.length !== 0, 'cursor-text': !disabled && selected.length !== 0 },
        !props.hideClearAllButton && 'pe-9',
        props.className,
      )}
      onClick={() => {
        if (!disabled) state.inputRef.current?.focus();
      }}
    >
      <div className="flex flex-wrap gap-1 w-full">
        {selected.map((option) => (
          <SelectedBadge
            key={option.value}
            option={option}
            disabled={disabled}
            className={props.badgeClassName}
            onRemove={() => state.remove(option)}
          />
        ))}
        <SelectorInput props={props} state={state} />
        <button
          type="button"
          onClick={() => state.change(fixed)}
          className={cn(
            'absolute end-0 top-0 flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70',
            (props.hideClearAllButton === true ||
              disabled === true ||
              fixed.length === selected.length) &&
              'hidden',
          )}
          aria-label="Clear all"
        >
          <IconX size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const SelectorOptions = ({ props, state }: PartProps) => {
  const { emptyIndicator, onSearch, creatable } = props;
  const showEmptyItem = onSearch && !creatable && Object.keys(state.groups).length === 0;

  if (state.isLoading) return props.loadingIndicator;

  return (
    <>
      {emptyIndicator &&
        (showEmptyItem ? (
          <Command.Item value="-" disabled>
            {emptyIndicator}
          </Command.Item>
        ) : (
          <MultiSelectEmpty>{emptyIndicator}</MultiSelectEmpty>
        ))}
      {state.canCreate && (
        <CreatableItem
          inputValue={state.inputValue}
          onCreate={(created) => state.select({ value: created, label: created })}
        />
      )}
      {props.selectFirstItem === false && <Command.Item value="-" className="hidden" />}
      <OptionGroups groups={withoutPicked(state.groups, state.selected)} onSelect={state.select} />
    </>
  );
};

const SelectorDropdown = ({ props, state }: PartProps) => (
  <div className="relative">
    <div
      className={cn(
        'absolute top-2 z-10 w-full overflow-hidden rounded-lg border',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        !state.open && 'hidden',
      )}
      data-state={state.open ? 'open' : 'closed'}
    >
      {state.open && (
        <Command.List
          className="bg-background shadow-lg shadow-black/5 outline-hidden"
          onMouseLeave={() => state.setOnScrollbar(false)}
          onMouseEnter={() => state.setOnScrollbar(true)}
          onMouseUp={() => state.inputRef.current?.focus()}
        >
          <SelectorOptions props={props} state={state} />
        </Command.List>
      )}
    </div>
  </div>
);

const searchFilter = (value: string, search: string) =>
  value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;

/** Picks several options from a list or a search, shown as removable badges. */
export const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (props, ref) => {
    const { commandProps, onSearch } = props;
    const state = useMultipleSelector(props, ref);
    const { dropdownRef } = state;

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const last = state.selected.at(-1);
      const erases = event.key === 'Delete' || event.key === 'Backspace';

      if (erases && !state.inputValue && last && !last.fixed) state.remove(last);

      if (event.key === 'Escape') state.inputRef.current?.blur();

      commandProps?.onKeyDown?.(event);
    };

    return (
      <Command
        ref={dropdownRef}
        {...commandProps}
        onKeyDown={onKeyDown}
        className={cn('h-auto overflow-visible bg-transparent', commandProps?.className)}
        // With onSearch the results are already filtered.
        shouldFilter={commandProps?.shouldFilter ?? !onSearch}
        filter={commandProps?.filter ?? (props.creatable ? searchFilter : undefined)}
      >
        <SelectorField props={props} state={state} />
        <SelectorDropdown props={props} state={state} />
      </Command>
    );
  },
);

MultipleSelector.displayName = 'MultipleSelector';
