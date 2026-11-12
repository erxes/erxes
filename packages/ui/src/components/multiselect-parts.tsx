import { IconX } from '@tabler/icons-react';
import { useCommandState } from 'cmdk';
import { Command } from 'erxes-ui/components/command';
import { cn } from 'erxes-ui/lib/utils';
import type { GroupedOptions, MultiSelectOption } from './multiselect-options';

/**
 * The `CommandEmpty` of shadcn/ui does not render cmdk's empty state correctly here,
 * so this copies cmdk's `Empty`.
 * @see https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 */
export const MultiSelectEmpty = ({ children }: { children: React.ReactNode }) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div className="px-2 py-4 text-center text-sm" cmdk-empty="" role="presentation">
      {children}
    </div>
  );
};

/** Stops the input losing focus when an option is pressed. */
const keepInputFocus = (event: React.MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

export const SelectedBadge = ({
  option,
  disabled,
  className,
  onRemove,
}: {
  option: MultiSelectOption;
  disabled?: boolean;
  className?: string;
  onRemove: () => void;
}) => (
  <div
    className={cn(
      'animate-fadeIn relative inline-flex h-7 cursor-default items-center rounded-md border border-solid bg-background pe-7 pl-2 ps-2 text-xs font-medium text-secondary-foreground transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-50 data-fixed:pe-2',
      className,
    )}
    data-fixed={option.fixed}
    data-disabled={disabled ? true : undefined}
  >
    {option.label}
    <button
      type="button"
      className="absolute -inset-y-px -end-px flex size-7 items-center justify-center rounded-e-lg border border-transparent p-0 text-muted-foreground/80 outline-0 transition-colors hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70"
      onMouseDown={keepInputFocus}
      onClick={onRemove}
      aria-label="Remove"
    >
      <IconX size={14} strokeWidth={2} aria-hidden="true" />
    </button>
  </div>
);

export const CreatableItem = ({
  inputValue,
  onCreate,
}: {
  inputValue: string;
  onCreate: (value: string) => void;
}) => (
  <Command.Item
    value={inputValue}
    className="cursor-pointer"
    onMouseDown={keepInputFocus}
    onSelect={onCreate}
  >
    {`Create "${inputValue}"`}
  </Command.Item>
);

export const OptionGroups = ({
  groups,
  onSelect,
}: {
  groups: GroupedOptions;
  onSelect: (option: MultiSelectOption) => void;
}) =>
  Object.entries(groups).map(([heading, options]) => (
    <Command.Group key={heading} heading={heading} className="h-full overflow-auto">
      {options.map((option) => (
        <Command.Item
          key={option.value}
          value={option.value}
          disabled={option.disable}
          onMouseDown={keepInputFocus}
          onSelect={() => onSelect(option)}
          className={cn('cursor-pointer', option.disable && 'cursor-not-allowed opacity-50')}
        >
          {option.label}
        </Command.Item>
      ))}
    </Command.Group>
  ));
