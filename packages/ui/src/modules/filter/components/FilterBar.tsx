import React from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useQueryState } from 'nuqs';
import type { Except } from 'type-fest';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';
import { useFilterContext } from '../hooks/useFilterContext';

export const FilterBar = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center gap-1 flex-1', className)}
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
  const [, setQuery] = useQueryState(filterKey ?? '');

  return (
    <Button
      ref={ref}
      variant="segment"
      size="icon"
      className={className}
      onClick={() => void setQuery(null)}
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
  const [query] = useQueryState(queryKey || 'root');

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
      variant="segment"
      className={cn('max-w-72', className)}
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
  const [searchValue] = useQueryState('searchValue');

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
