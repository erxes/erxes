import { cn } from 'erxes-ui';
import {
  createContext,
  type ReactNode,
  type ReactPortal,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { RecordSidePanel } from 'ui-modules';

const BotPanelTargetContext = createContext<HTMLElement | null>(null);

/** Keeps bot forms beside their list while the host renders the page header. */
export const AutomationBotsPage = ({
  actions,
  renderHeader,
  listHeader,
  children,
}: Readonly<{
  actions: ReactNode;
  renderHeader?: (actions: ReactNode) => ReactNode;
  listHeader?: ReactNode;
  children: ReactNode;
}>) => {
  const [panelTarget, setPanelTarget] = useState<HTMLDivElement | null>(null);
  return (
    <BotPanelTargetContext.Provider value={panelTarget}>
      <div className="flex min-h-0 flex-1 flex-col">
        {renderHeader ? renderHeader(actions) : actions}
        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pb-6">
            {listHeader && <div className="shrink-0 py-6">{listHeader}</div>}
            {children}
          </div>
          <div ref={setPanelTarget} className="contents" />
        </div>
      </div>
    </BotPanelTargetContext.Provider>
  );
};

/** Portals a resizable bot editor without unmounting its parent form. */
export const AutomationBotPanel = ({
  children,
  hidden = false,
  onClose,
}: Readonly<{
  children: ReactNode;
  hidden?: boolean;
  onClose: () => void;
}>) => {
  const target = useContext(BotPanelTargetContext);
  const [width, setWidth] = useState(480);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hidden || !target) return;
    const previousFocus = document.activeElement;
    const container = containerRef.current;
    container?.querySelector<HTMLElement>('input, textarea, button')?.focus();
    return () => {
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        (container?.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        previousFocus.focus();
      }
    };
  }, [hidden, target]);
  useEffect(() => {
    if (hidden || !target) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"][data-state="open"]',
        )
      )
        return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hidden, target, onClose]);
  if (!target) return null;
  // React DOM resolves a separate React type version at this library boundary.
  const portal = createPortal(
    (
      <div ref={containerRef} className="contents">
        <RecordSidePanel
          width={width}
          onWidthChange={setWidth}
          expandable={false}
          className={cn('h-full', hidden && 'hidden')}
        >
          {children}
        </RecordSidePanel>
      </div>
    ) as Parameters<typeof createPortal>[0],
    target,
  ) as unknown as ReactPortal;
  return <>{portal}</>;
};
