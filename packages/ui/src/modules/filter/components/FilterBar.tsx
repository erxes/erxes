import { z } from 'zod';
import React from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { Except } from 'type-fest';
import { Button } from 'erxes-ui/components/button';
import { useRemoveQueryStateByKey } from 'erxes-ui/hooks/use-query-state';
import { cn } from 'erxes-ui/lib/utils';
import { useFilterContext } from '../hooks/useFilterContext';
import { useFilterQueryState } from '../hooks/useFilterQueryState';

export const FilterBar = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center gap-2 flex-1', className)}
      {...props}
    />
  );
};

export const FilterBarCloseButton = ({
  ref,
  className,
  filterKey,
  ...props
}: Except<React.ComponentPropsWithoutRef<typeof Button>, 'value'> & {
  filterKey?: string;
} & React.RefAttributes<React.ComponentRef<typeof Button>>) => {
  const removeQuery = useRemoveQueryStateByKey();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('rounded-l-none', !props.variant && 'bg-background', className)}
      onClick={() => removeQuery(filterKey ?? '')}
      {...props}
    >
      <IconX />
    </Button>
  );
};

export const FilterBarItem = ({
  ref,
  className,
  queryKey,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  queryKey?: string;
} & React.RefAttributes<HTMLDivElement>) => {
  const [query] = useFilterQueryState(queryKey || 'root', z.string());

  if (queryKey && !query) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium',
        className,
      )}
      {...props}
    >
      {children}
      <FilterBarCloseButton filterKey={queryKey} />
    </div>
  );
};

export const FilterBarName = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-background rounded-l [&>svg]:size-4 flex items-center px-2 gap-2 w-fit',
        className,
      )}
      {...props}
    />
  );
};

export const FilterBarButton = ({
  ref,
  className,
  inDialog,
  filterKey,
  ...props
}: Except<React.ComponentPropsWithoutRef<typeof Button>, 'value'> & {
  inDialog?: boolean;
  filterKey?: string;
} & React.RefAttributes<React.ComponentRef<typeof Button>>) => {
  const { setDialogView, setOpenDialog } = useFilterContext();

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'rounded-none focus-visible:z-10 max-w-72 transition focus-visible:shadow-focus outline-hidden focus-visible:outline-hidden focus-visible:outline-offset-0 focus-visible:outline-transparent',
        !props.variant && 'bg-background',
        className,
      )}
      onClick={() => {
        if (inDialog) {
          setDialogView(filterKey ?? 'root');
          setOpenDialog(true);
        }
      }}
      {...props}
    />
  );
};

export const FilterSearchValueBarItem = () => {
  const [searchValue] = useFilterQueryState('searchValue', z.string());

  return (
    <FilterBarItem queryKey="searchValue">
      <FilterBarName>
        <IconSearch />
        Search
      </FilterBarName>
      <FilterBarButton filterKey="searchValue" inDialog>
        {searchValue}
      </FilterBarButton>
    </FilterBarItem>
  );
};
