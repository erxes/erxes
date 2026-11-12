import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { Sheet } from 'erxes-ui/components/sheet';
import { Sidebar } from 'erxes-ui/components/sidebar';
import { Spinner } from 'erxes-ui/components/spinner';
import { cn } from 'erxes-ui/lib/utils';
import { useMediaQuery } from 'erxes-ui/hooks/use-media-query';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { FocusSheetContext, useFocusSheet } from './focus-sheet-context';
import {
  FocusSheetSideContent,
  FocusSheetSideContentHeader,
  FocusSheetSideTabs,
  FocusSheetSideTabsList,
  FocusSheetSideTabsTrigger,
} from './focus-sheet-side-tabs';

const FocusSheetRoot = ({ ...props }: React.ComponentProps<typeof Sheet>) => {
  const isNarrow = useMediaQuery('(max-width: 639px)');
  const [hasSidebar, setHasSidebar] = useState(false);

  // The member's choice holds until the screen crosses the narrow breakpoint.
  const [sidebarChoice, setSidebarChoice] = useState<{ narrow: boolean; open: boolean } | null>(
    null,
  );

  const [activeSideTab, setActiveSideTab] = useState<string | null>(null);

  const isSidebarOpen = sidebarChoice?.narrow === isNarrow ? sidebarChoice.open : !isNarrow;

  return (
    <FocusSheetContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen: (open) => setSidebarChoice({ narrow: isNarrow, open }),
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

const statusTitle = (loading?: boolean, error?: boolean, notFound?: boolean) => {
  if (loading) return 'Loading';

  if (error) return 'Error';

  return notFound ? 'Not found' : null;
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
  const status = statusTitle(loading, error, notFound);

  return (
    <Sheet.View
      className={cn(
        'p-0 transition-[width] flex flex-col gap-0 overflow-hidden sm:max-w-screen-2xl md:w-[calc(100vw-(--spacing(4)))] lg:w-3/4',
        !!activeSideTab && 'lg:w-[calc(100vw-(--spacing(4)))]',
        className,
      )}
      {...props}
    >
      {status && <Sheet.Title className="sr-only">{status}</Sheet.Title>}
      {loading && <Spinner />}
      {!loading && error && errorState}
      {!loading && !error && notFound && notFoundState}
      {!status && children}
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
          {description ? description : title}
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
