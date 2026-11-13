import React, { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { IconChevronLeft, IconChevronRight, IconFilter2, IconSearch } from '@tabler/icons-react';
import type { Except } from 'type-fest';
import { useTranslation } from 'react-i18next';
import { Button } from 'erxes-ui/components/button';
import { Command } from 'erxes-ui/components/command';
import { Kbd } from 'erxes-ui/components/kbd';
import { Popover } from 'erxes-ui/components/popover';
import { Tooltip } from 'erxes-ui/components/tooltip';
import { cn } from 'erxes-ui/lib/utils';
import { usePreviousHotkeyScope } from 'erxes-ui/modules/hotkey/hooks/usePreviousHotkeyScope';
import { useFilterContext } from '../hooks/useFilterContext';
import {
  filterDialogViewState,
  filterPopoverViewState,
  openDialogState,
  openPopoverState,
} from '../states/filterStates';

export const FilterTrigger = ({
  ref,
  isFiltered,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button> & {
  isFiltered?: boolean;
} & React.RefAttributes<HTMLButtonElement>) => {
  const { t } = useTranslation();

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              size={isFiltered ? 'icon' : 'default'}
              // Its icon lines up with the page's content, as the first
              // breadcrumb's does, with or without the label.
              className={cn(isFiltered ? '-ml-1.5' : '-ml-2 pl-2', className)}
              {...props}
            >
              <IconFilter2 className="w-4 h-4" />
              {!isFiltered && t('filter._')}
            </Button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content>{t('filter._')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const FilterPopover = ({
  scope,
  ...props
}: React.ComponentPropsWithoutRef<typeof Popover> & {
  scope?: string;
}) => {
  const { id } = useFilterContext();
  const [open, setOpen] = useAtom(openPopoverState(id));
  const setView = useSetAtom(filterPopoverViewState(id));

  const { setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope } =
    usePreviousHotkeyScope();

  useEffect(() => {
    if (open) {
      setHotkeyScopeAndMemorizePreviousScope(`${scope}.FilterPopover`);
    } else {
      goBackToPreviousHotkeyScope();
    }
  }, [goBackToPreviousHotkeyScope, open, scope, setHotkeyScopeAndMemorizePreviousScope]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) setView('root');
      }}
      {...props}
    />
  );
};

export const FilterItem = ({
  ref,
  children,
  value,
  inDialog,
  className,
  active,
  ...props
}: Except<React.ComponentPropsWithoutRef<typeof Command.Item>, 'value'> & {
  value: string;
  inDialog?: boolean;
  active?: boolean;
} & React.RefAttributes<React.ComponentRef<typeof Command.Item>>) => {
  const { id } = useFilterContext();
  const setDialogView = useSetAtom(filterDialogViewState(id));
  const setOpenDialog = useSetAtom(openDialogState(id));
  const setOpen = useSetAtom(openPopoverState(id));
  const setView = useSetAtom(filterPopoverViewState(id));

  const onSelect = () => {
    if (inDialog) {
      setDialogView(value);
      setOpenDialog(true);
      setOpen(false);
    } else {
      setView(value);
    }
  };

  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      ref={ref}
      className={cn('h-8', active && 'text-primary-text', className)}
      {...props}
    >
      {children}
      <IconChevronRight className="w-4 h-4 ml-auto" />
    </Command.Item>
  );
};

export const FilterCommandItem = ({
  ref,
  className,
  onSelect,
  ...props
}: React.ComponentProps<typeof Command.Item>) => {
  const { id } = useFilterContext();
  const setOpen = useSetAtom(openPopoverState(id));

  const handleSelect = (value: string) => {
    setOpen(false);
    onSelect?.(value);
  };

  return (
    <Command.Item
      ref={ref}
      className={cn('h-8', className)}
      onSelect={(value) => handleSelect(value)}
      {...props}
    />
  );
};

const FilterBackButton = () => {
  const { id } = useFilterContext();
  const setView = useSetAtom(filterPopoverViewState(id));

  return (
    <button
      type="button"
      onClick={() => setView('root')}
      className="flex h-8 w-full items-center gap-1 border-b px-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <IconChevronLeft className="size-4" />
      Back
    </button>
  );
};

const FilterViewNesting = React.createContext(false);

export const FilterView = ({
  children,
  filterKey = 'root',
  inDialog,
}: {
  children: React.ReactNode;
  filterKey?: string;
  inDialog?: boolean;
}) => {
  const { id } = useFilterContext();
  const view = useAtomValue(filterPopoverViewState(id));
  const dialogView = useAtomValue(filterDialogViewState(id));
  const isNested = React.useContext(FilterViewNesting);

  if (inDialog ? dialogView !== filterKey : view !== filterKey) {
    return null;
  }

  if (inDialog || filterKey === 'root' || isNested) {
    return children;
  }

  return (
    <FilterViewNesting.Provider value={true}>
      <FilterBackButton />
      {children}
    </FilterViewNesting.Provider>
  );
};

export const FilterCommandInput = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Command.Input> &
  React.RefAttributes<HTMLInputElement>) => {
  return (
    <div className="relative">
      <Command.Input ref={ref} className={cn('pr-8', className)} {...props} />
      <Kbd className="absolute right-2 top-1/2 -translate-y-1/2" variant="foreground">
        F
      </Kbd>
    </div>
  );
};

export const FilterSearchValueTrigger = () => (
  <FilterItem value="searchValue" inDialog>
    <IconSearch />
    Search
  </FilterItem>
);
