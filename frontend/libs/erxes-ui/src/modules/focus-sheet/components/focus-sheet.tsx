import {
  Icon as TablerIcon,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  Separator,
  Sheet,
  Sidebar,
  Spinner,
  Tabs,
  Tooltip,
} from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
} from 'react';

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

const FocusSheetRoot = ({ ...props }: React.ComponentProps<typeof Sheet>) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasSidebar, setHasSidebar] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<string | null>(null);
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
        'p-0 transition-[width] flex flex-col gap-0 overflow-hidden sm:max-w-screen-2xl',
        !!activeSideTab &&
          'w-[calc(100vw-(--spacing(4)))] md:w-[calc(100vw-(--spacing(4)))]',
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && error && errorState}
      {!loading && !error && notFound && notFoundState}
      {!loading && !error && !notFound && children}
    </Sheet.View>
  );
};

const FocusSheetContent = ({
  className,
  ...props
}: React.ComponentProps<typeof Sheet.Content>) => {
  return (
    <Sheet.Content
      className={cn(
        'flex border-b-0 rounded-b-none overflow-y-hidden',
        className,
      )}
      {...props}
    />
  );
};

const FocusSheetSideBar = ({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
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
      className={cn('flex-none w-64 border-r', className)}
      {...props}
    />
  );
};
FocusSheetSideBar.displayName = 'FocusSheetSideBar';

const FocusSheetSidebarTrigger = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useFocusSheet();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      {isSidebarOpen ? (
        <IconLayoutSidebarLeftCollapse />
      ) : (
        <IconLayoutSidebarLeftExpand />
      )}
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
      className={cn('flex', className)}
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
        'data-[state=active]:border-l data-[state=active]:min-w-80 w-full transition-all data-[state=active]:flex flex-col overflow-hidden bg-sidebar',
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
        className={cn(
          'h-11 px-5 flex items-center gap-2 flex-none bg-background',
          className,
        )}
        {...props}
      >
        {!!Icon && (
          <Icon className="size-4 flex-none text-primary" strokeWidth={3} />
        )}
        <div className="mr-auto font-medium text-primary capitalize">
          {label}
        </div>
        {children}
      </div>
      {!hideSeparator && <Separator />}
    </>
  );
});
FocusSheetSideContentHeader.displayName = 'FocusSheetSideContentHeader';

const FocusSheetSideTabsList = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Tabs.List>
>(({ className, ...props }, ref) => {
  return (
    <Tabs.List
      ref={ref}
      className={cn(
        'w-16 border-l bg-sidebar h-full py-3 flex flex-col items-center justify-start gap-3 border-b-0',
        className,
      )}
      {...props}
    >
      <Tooltip.Provider>{props.children}</Tooltip.Provider>
    </Tabs.List>
  );
});
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
                activeSideTab === value &&
                  'group-hover/side-tabs-trigger:hidden',
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
    <Sheet.Header className={cn('gap-2', className)} {...props}>
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
