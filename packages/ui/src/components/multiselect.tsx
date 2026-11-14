import { Combobox } from '@base-ui/react/combobox';
import { IconX } from '@tabler/icons-react';
import { type RefObject, useRef, useState } from 'react';
import { cn } from 'erxes-ui/lib/utils';

export type MultiSelectOption = { value: string; label: string };

// The typed text offered as a new option, when `creatable` is on and nothing matches it.
type Choice = MultiSelectOption & { created?: true };

type MultipleSelectorProps = {
  value?: MultiSelectOption[];
  onChange?: (options: MultiSelectOption[]) => void;
  options?: MultiSelectOption[];
  placeholder?: string;
  hidePlaceholderWhenSelected?: boolean;
  /** Offers the typed text as an option when no option has that value. */
  creatable?: boolean;
  emptyIndicator?: React.ReactNode;
  disabled?: boolean;
  /** The input's id, for a label's htmlFor. */
  id?: string;
  className?: string;
};

/** The picked badges, the input and the clear-all button. */
const SelectorField = ({
  fieldRef,
  value,
  placeholder,
  hidePlaceholderWhenSelected,
  disabled,
  id,
  className,
}: Required<Pick<MultipleSelectorProps, 'value' | 'placeholder'>> &
  Pick<MultipleSelectorProps, 'hidePlaceholderWhenSelected' | 'disabled' | 'id' | 'className'> & {
    fieldRef: RefObject<HTMLDivElement | null>;
  }) => {
  const empty = value.length === 0;

  return (
    <Combobox.Chips
      ref={fieldRef}
      className={cn(
        'relative min-h-7 rounded shadow-xs transition text-sm focus-within:outline-hidden focus-within:shadow-focus has-disabled:cursor-not-allowed has-disabled:opacity-50 pe-9',
        // Not p-1: tailwind-merge would drop the pe-9 that keeps the chips clear of Clear all.
        !empty && 'py-1 ps-1',
        !disabled && !empty && 'cursor-text',
        className,
      )}
    >
      <div className="flex flex-wrap gap-1 w-full">
        {value.map((option) => (
          <Combobox.Chip
            key={option.value}
            className="animate-fadeIn relative inline-flex h-7 cursor-default items-center rounded-md border border-solid bg-background pe-7 pl-2 ps-2 text-xs font-medium text-secondary-foreground transition-all hover:bg-background data-disabled:cursor-not-allowed data-disabled:opacity-50"
          >
            {option.label}
            <Combobox.ChipRemove
              aria-label="Remove"
              className="absolute -inset-y-px -end-px flex size-7 items-center justify-center rounded-e-lg border border-transparent p-0 text-muted-foreground/80 outline-0 transition-colors hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70"
            >
              <IconX size={14} strokeWidth={2} aria-hidden="true" />
            </Combobox.ChipRemove>
          </Combobox.Chip>
        ))}
        <div className="flex items-center bg-background min-w-0 flex-1 basis-32 rounded-lg overflow-hidden">
          <Combobox.Input
            id={id}
            placeholder={hidePlaceholderWhenSelected && !empty ? '' : placeholder}
            className={cn(
              'flex h-7 w-full flex-1 rounded-md bg-transparent text-sm font-medium outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
              empty ? 'px-3 py-2' : 'ml-1 px-3',
            )}
          />
        </div>
        <Combobox.Clear
          aria-label="Clear all"
          className={cn(
            'absolute end-0 top-0 flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70',
            (disabled === true || empty) && 'hidden',
          )}
        >
          <IconX size={16} strokeWidth={2} aria-hidden="true" />
        </Combobox.Clear>
      </div>
    </Combobox.Chips>
  );
};

/** The options under the field, as wide as it. */
const SelectorPopup = ({
  fieldRef,
  emptyIndicator,
}: {
  fieldRef: RefObject<HTMLDivElement | null>;
  emptyIndicator?: React.ReactNode;
}) => (
  <Combobox.Portal>
    <Combobox.Positioner
      anchor={fieldRef}
      sideOffset={8}
      collisionPadding={0}
      className="isolate z-50"
    >
      <Combobox.Popup className="w-(--anchor-width) overflow-hidden rounded-lg border bg-background shadow-lg shadow-black/5 outline-hidden data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95">
        {emptyIndicator && (
          <Combobox.Empty className="px-2 py-4 text-center text-sm empty:hidden">
            {emptyIndicator}
          </Combobox.Empty>
        )}
        <Combobox.List className="max-h-72 overflow-y-auto hide-scroll m-1 p-1 text-foreground empty:hidden">
          {(item: Choice) => (
            <Combobox.Item
              key={item.value}
              value={item}
              className="relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              {item.label}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
);

const has = (list: MultiSelectOption[], key: string) => list.some((item) => item.value === key);

/** Picks several options from a list, shown as removable badges; picked options leave the list. */
export const MultipleSelector = ({
  value = [],
  onChange,
  options = [],
  placeholder = 'Search',
  creatable,
  emptyIndicator,
  disabled,
  ...fieldProps
}: MultipleSelectorProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const typed = query.trim();
  const choices: Choice[] = options.filter((option) => !has(value, option.value));

  if (creatable && typed && !has(options, typed) && !has(value, typed)) {
    choices.push({ value: typed, label: `Create "${typed}"`, created: true });
  }

  return (
    <Combobox.Root
      multiple
      items={choices}
      value={value}
      onValueChange={(next: Choice[]) =>
        onChange?.(
          next.map((item) => ({
            value: item.value,
            label: item.created ? item.value : item.label,
          })),
        )
      }
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item: Choice) => item.label}
      isItemEqualToValue={(item: Choice, picked: Choice) => item.value === picked.value}
      disabled={disabled}
    >
      <SelectorField
        fieldRef={fieldRef}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        {...fieldProps}
      />
      <SelectorPopup fieldRef={fieldRef} emptyIndicator={emptyIndicator} />
    </Combobox.Root>
  );
};
