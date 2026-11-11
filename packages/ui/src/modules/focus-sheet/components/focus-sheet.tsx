import {
  Icon as TablerIcon,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconX,
} from '@tabler/icons-react';
import { Button, Separator, Sheet, Sidebar, Spinner, Tabs, Tooltip } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { useMediaQuery } from 'erxes-ui/hooks';
import { useTranslation } from 'react-i18next';
import React, { createContext, forwardRef, useContext, useEffect, useState } from 'react';

const FocusSheetContext = createContext<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  activeSideTab?: string | null;
  setActiveSideTab?: (activeSideTab: string | null) => void;
  hasSidebar?: boolean;
  setHasSidebar?: (hasSidebar: boolean) => void;
} | null>(null);

export const useFocusSheet = () => {
  const context = useContext(FocusSheetContext);
  if (!context) {
    throw new Error('useFocusSheet must be used within a FocusSheetProvider');
  }
  return context;
};

// The enclosing FocusSheet's state, or `null` outside one.
export const useOptionalFocusSheet = () => useContext(FocusSheetContext);

const FocusSheetRoot = ({ ...props }: React.ComponentProps<typeof Sheet>) => {
  const isNarrow = useMediaQuery('(max-width: 639px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isNarrow);
  const [hasSidebar, setHasSidebar] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<string | null>(null);
  useEffect(() => {
    setIsSidebarOpen(!isNarrow);
  }, [isNarrow]);
  return (
    <FocusSheetContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        activeSideTab,
        setActiveSideTab,
        hasSidebar,
        setHasSidebar,
      }}
    >
      <Sheet {...props} />
    </FocusSheetContext.Provider>
  );
};

const FocusSheetView = ({
  className,
  loading,
  error,
  notFound,
  children,
  errorState,
  notFoundState,
  ...props
}: React.ComponentProps<typeof Sheet.View> & {
  loading?: boolean;
  error?: boolean;
  notFound?: boolean;
  children?: React.ReactNode;
  errorState?: React.ReactNode;
  notFoundState?: React.ReactNode;
}) => {
  const { activeSideTab } = useFocusSheet();
  return (
    <Sheet.View
      className={cn(
        'p-0 transition-[width] flex flex-col gap-0 overflow-hidden sm:max-w-screen-2xl md:w-[calc(100vw-(--spacing(4)))] lg:w-3/4',
        !!activeSideTab && 'lg:w-[calc(100vw-(--spacing(4)))]',
        className,
      )}
      {...props}
    >
      {(loading || error || notFound) && (
        <Sheet.Title className="sr-only">
          {loading ? 'Loading' : error ? 'Error' : 'Not found'}
        </Sheet.Title>
      )}
      {loading && <Spinner />}
      {!loading && error && errorState}
      {!loading && !error && notFound && notFoundState}
      {!loading && !error && !notFound && children}
    </Sheet.View>
  );
};

const FocusSheetContent = ({ className, ...props }: React.ComponentProps<typeof Sheet.Content>) => {
  // Radix's table wrapper otherwise imposes its contents' minimum width.
  return (
    <Sheet.Content
      className={cn(
        'flex min-h-0 min-w-0 flex-col lg:flex-row border-b-0 rounded-b-none overflow-y-hidden [&>div]:min-w-0 [&>div]:min-h-0 [&_[data-radix-scroll-area-viewport]>div]:block!',
        className,
      )}
      {...props}
    />
  );
};

const FocusSheetSideBar = ({ className, ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { isSidebarOpen, setHasSidebar } = useFocusSheet();
  useEffect(() => {
    setHasSidebar?.(true);
  }, [setHasSidebar]);

  if (!isSidebarOpen) {
    return null;
  }
  return (
    <Sidebar
      collapsible="none"
      className={cn(
        'flex-none h-auto w-full max-h-40 overflow-y-auto border-b lg:h-full lg:max-h-none lg:w-64 lg:border-b-0 lg:border-r',
        className,
      )}
      {...props}
    />
  );
};
FocusSheetSideBar.displayName = 'FocusSheetSideBar';

const FocusSheetSidebarTrigger = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useFocusSheet();
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        isSidebarOpen
          ? t('hide-navigation', 'Hide navigation')
          : t('show-navigation', 'Show navigation')
      }
      aria-expanded={isSidebarOpen}
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      {isSidebarOpen ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
    </Button>
  );
};

const FocusSheetSideTabs = forwardRef<
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
      value={activeSideTab || undefined}
      {...props}
    />
  );
});

FocusSheetSideTabs.displayName = 'FocusSheetSideTabs';

const FocusSheetSideContent = forwardRef<
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

const FocusSheetSideContentHeader = forwardRef<
  React.ElementRef<'div'>,
  React.ComponentProps<'div'> & {
    Icon?: TablerIcon;
    label?: string;
    hideSeparator?: boolean;
  }
>(({ className, Icon, label, children, hideSeparator, ...props }, ref) => {
  return (
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
  );
});
FocusSheetSideContentHeader.displayName = 'FocusSheetSideContentHeader';

const FocusSheetSideTabsList = forwardRef<HTMLDivElement, React.ComponentProps<typeof Tabs.List>>(
  ({ className, ...props }, ref) => {
    return (
      <Tabs.List
        ref={ref}
        className={cn(
          'w-full lg:w-12 flex-none border-t lg:border-t-0 lg:border-l bg-sidebar h-12 lg:h-full py-1 lg:py-3 flex flex-row lg:flex-col items-center justify-start gap-3 border-b-0',
          className,
        )}
        {...props}
      >
        <Tooltip.Provider>{props.children}</Tooltip.Provider>
      </Tabs.List>
    );
  },
);
FocusSheetSideTabsList.displayName = 'FocusSheetSideTabsList';

const FocusSheetSideTabsTrigger = forwardRef<
  React.ElementRef<typeof Tabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof Tabs.Trigger> & {
    label?: string;
    Icon?: TablerIcon;
    value: string;
  }
>(({ className, Icon, label, value, onClick, ...props }, ref) => {
  const { activeSideTab, setActiveSideTab } = useFocusSheet();
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
            setActiveSideTab?.(activeSideTab === value ? null : value);
          }}
          {...props}
        >
          {!!Icon && (
            <Icon
              className={cn(
                'size-5 flex-none',
                activeSideTab === value && 'group-hover/side-tabs-trigger:hidden',
              )}
            />
          )}
          {activeSideTab === value && (
            <IconX className="size-5 flex-none hidden group-hover/side-tabs-trigger:block" />
          )}
        </Tabs.Trigger>
      </Tooltip.Trigger>

      <Tooltip.Content side="left">{label}</Tooltip.Content>
    </Tooltip>
  );
});
FocusSheetSideTabsTrigger.displayName = 'FocusSheetSideTabsTrigger';

const FocusSheetHeader = ({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof Sheet.Header> & {
  title?: string;
  description?: string;
}) => {
  const { hasSidebar } = useFocusSheet();
  return (
    <Sheet.Header className={cn('gap-2', description && 'h-auto py-2', className)} {...props}>
      {hasSidebar && <FocusSheetSidebarTrigger />}
      <div className="flex flex-col">
        <Sheet.Title>{title}</Sheet.Title>
        <Sheet.Description className={cn(!description && 'sr-only')}>
          {description || title}
        </Sheet.Description>
      </div>
      {children}
      <Sheet.Close />
    </Sheet.Header>
  );
};
FocusSheetHeader.displayName = 'FocusSheetHeader';

export const FocusSheet = Object.assign(FocusSheetRoot, {
  Header: FocusSheetHeader,
  View: FocusSheetView,
  Content: FocusSheetContent,
  SideBar: FocusSheetSideBar,
  SidebarTrigger: FocusSheetSidebarTrigger,
  SideTabs: FocusSheetSideTabs,
  SideContent: FocusSheetSideContent,
  SideContentHeader: FocusSheetSideContentHeader,
  SideTabsList: FocusSheetSideTabsList,
  SideTabsTrigger: FocusSheetSideTabsTrigger,
});
