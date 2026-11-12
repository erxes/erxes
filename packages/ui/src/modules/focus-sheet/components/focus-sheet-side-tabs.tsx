import type { Icon as TablerIcon } from '@tabler/icons-react';
import { IconX } from '@tabler/icons-react';
import { Separator } from 'erxes-ui/components/separator';
import { Tabs } from 'erxes-ui/components/tabs';
import { Tooltip } from 'erxes-ui/components/tooltip';
import { cn } from 'erxes-ui/lib/utils';
import React, { forwardRef } from 'react';
import { useFocusSheet } from './focus-sheet-context';

export const FocusSheetSideTabs = forwardRef<
  React.ElementRef<typeof Tabs>,
  React.ComponentProps<typeof Tabs>
>(({ className, ...props }, ref) => {
  const { activeSideTab } = useFocusSheet();

  return (
    <Tabs
      ref={ref}
      className={cn(
        'flex min-h-0 min-w-0 shrink-0 max-lg:flex-col-reverse max-lg:max-h-1/2',
        className,
      )}
      orientation="horizontal"
      value={activeSideTab ?? undefined}
      {...props}
    />
  );
});

FocusSheetSideTabs.displayName = 'FocusSheetSideTabs';

export const FocusSheetSideContent = forwardRef<
  React.ElementRef<typeof Tabs.Content>,
  React.ComponentProps<typeof Tabs.Content>
>(({ className, children, ...props }, ref) => {
  const { activeSideTab } = useFocusSheet();

  if (!activeSideTab) {
    return null;
  }

  return (
    <Tabs.Content
      ref={ref}
      className={cn(
        'lg:data-[state=active]:border-l lg:data-[state=active]:min-w-80 min-w-0 w-full max-lg:w-full! max-lg:max-w-full! max-lg:flex-1 max-lg:min-h-0 transition-all data-[state=active]:flex flex-col overflow-hidden bg-sidebar',
        className,
      )}
      {...props}
    >
      {children}
    </Tabs.Content>
  );
});

FocusSheetSideContent.displayName = 'FocusSheetSideContent';

export const FocusSheetSideContentHeader = forwardRef<
  React.ElementRef<'div'>,
  React.ComponentProps<'div'> & {
    Icon?: TablerIcon;
    label?: string;
    hideSeparator?: boolean;
  }
>(({ className, Icon, label, children, hideSeparator, ...props }, ref) => (
  <>
    <div
      ref={ref}
      className={cn('h-10 px-4 flex items-center gap-2 flex-none bg-background', className)}
      {...props}
    >
      {!!Icon && <Icon className="size-4 flex-none text-primary" strokeWidth={3} />}
      <div className="mr-auto font-medium text-primary capitalize">{label}</div>
      {children}
    </div>
    {!hideSeparator && <Separator />}
  </>
));

FocusSheetSideContentHeader.displayName = 'FocusSheetSideContentHeader';

export const FocusSheetSideTabsList = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Tabs.List>
>(({ className, children, ...props }, ref) => (
  <Tabs.List
    ref={ref}
    className={cn(
      'w-full lg:w-12 flex-none border-t lg:border-t-0 lg:border-l bg-sidebar h-12 lg:h-full py-1 lg:py-3 flex flex-row lg:flex-col items-center justify-start gap-3 border-b-0',
      className,
    )}
    {...props}
  >
    <Tooltip.Provider>{children}</Tooltip.Provider>
  </Tabs.List>
));

FocusSheetSideTabsList.displayName = 'FocusSheetSideTabsList';

export const FocusSheetSideTabsTrigger = forwardRef<
  React.ElementRef<typeof Tabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof Tabs.Trigger> & {
    label?: string;
    Icon?: TablerIcon;
    value: string;
  }
>(({ className, Icon, label, value, onClick, ...props }, ref) => {
  const { activeSideTab, setActiveSideTab } = useFocusSheet();
  const isActive = activeSideTab === value;

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Tabs.Trigger
          ref={ref}
          className={cn(
            'size-10 bg-sidebar data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none [&_svg]:size-5 data-[state=active]:after:hidden [&_svg]:text-primary hover:bg-primary/10 data-[state=active]:hover:bg-primary/10 rounded group/side-tabs-trigger',
            className,
          )}
          value={value}
          onClick={(e) => {
            onClick?.(e);
            setActiveSideTab?.(isActive ? null : value);
          }}
          {...props}
        >
          {!!Icon && (
            <Icon
              className={cn('size-5 flex-none', isActive && 'group-hover/side-tabs-trigger:hidden')}
            />
          )}
          {isActive && (
            <IconX className="size-5 flex-none hidden group-hover/side-tabs-trigger:block" />
          )}
        </Tabs.Trigger>
      </Tooltip.Trigger>

      <Tooltip.Content side="left">{label}</Tooltip.Content>
    </Tooltip>
  );
});

FocusSheetSideTabsTrigger.displayName = 'FocusSheetSideTabsTrigger';
