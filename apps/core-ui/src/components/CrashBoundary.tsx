import { IconAlertTriangle, IconRefresh, IconReload } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { createContext, Suspense, use, useEffect, useState, type ReactNode } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { PageSpinner } from '~/components/PageSpinner';
import { messageOf } from '~/lib/api';

/**
 * `app` catches what the page boundary can't (the top bar, the layout); `page` sits
 * inside the layout, so the top bar and the side panel keep their state when a page crashes.
 */
type CrashScope = 'app' | 'page';

const CrashFallback = ({ scope }: { scope: CrashScope }) => {
  const { t } = useTranslation('common', { keyPrefix: 'crash' });
  const { error, resetBoundary } = useErrorBoundary();

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${scope === 'app' ? 'h-svh' : 'h-full'}`}
    >
      <IconAlertTriangle className="size-8 text-destructive" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-medium">{t(scope === 'app' ? 'app-title' : 'page-title')}</p>
        <p className="max-w-md text-sm break-words text-muted-foreground">{messageOf(error)}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetBoundary}>
          <IconRefresh />
          {t('try-again')}
        </Button>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          <IconReload />
          {t('reload')}
        </Button>
      </div>
      <p className="max-w-md text-xs text-muted-foreground">{t('reload-hint')}</p>
    </div>
  );
};

/** Development only: a page boundary tells the one above it that it takes the forced crash. */
const OuterPage = createContext<((nested: boolean) => void) | null>(null);

/**
 * Development only: `dispatchEvent(new CustomEvent('erxes:crash', { detail: 'page' }))`
 * in the browser console makes the next render throw, to try the fallback. Page boundaries
 * nest (MainLayout, then a module layout), and only the innermost throws. Fire it on a
 * rendered page: during a navigation the module layout is not mounted yet, so MainLayout's
 * boundary takes it. The state lives
 * below the boundary, so "Try again" remounts it and the page recovers.
 */
const DevCrash = ({ scope, children }: { scope: CrashScope; children: ReactNode }) => {
  const [crash, setCrash] = useState(false);
  const [nested, setNested] = useState(false);
  const outer = use(OuterPage);

  useEffect(() => {
    if (scope !== 'page' || !outer) return;

    outer(true);

    return () => outer(false);
  }, [scope, outer]);

  useEffect(() => {
    const onCrash = (event: Event) => {
      if (event instanceof CustomEvent && event.detail === scope && !nested) setCrash(true);
    };

    window.addEventListener('erxes:crash', onCrash);

    return () => window.removeEventListener('erxes:crash', onCrash);
  }, [scope, nested]);

  if (crash) throw new Error(`Forced ${scope} crash (development only)`);

  return scope === 'page' ? <OuterPage value={setNested}>{children}</OuterPage> : children;
};

/** A render error below shows what failed, with retry and reload. Moving to another page resets it. */
export const CrashBoundary = ({ scope, children }: { scope: CrashScope; children: ReactNode }) => {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary
      resetKeys={[pathname]}
      onError={(error, info) =>
        console.error(`[crash] ${scope} ${pathname}`, error, info.componentStack)
      }
      fallback={<CrashFallback scope={scope} />}
    >
      {import.meta.env.DEV ? <DevCrash scope={scope}>{children}</DevCrash> : children}
    </ErrorBoundary>
  );
};

/**
 * Where a layout renders its route. A crash or a lazy load replaces only the route,
 * so the layout's sidebar (Contacts, Settings, …) stays usable.
 */
export const PageOutlet = () => (
  <CrashBoundary scope="page">
    <Suspense fallback={<PageSpinner />}>
      <Outlet />
    </Suspense>
  </CrashBoundary>
);
