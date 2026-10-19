import { cn } from 'erxes-ui';
import { useAtom } from 'jotai';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RecordSidePanel,
  SIDE_PANEL_CHAT_PATH,
  sidePanelWidthState,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';

const SidePanelChat = lazy(() =>
  import('./SidePanelChat').then((module) => ({
    default: module.SidePanelChat,
  })),
);

// Leave room for the workspace while allowing a much wider transcript.
const getMaxWidth = () =>
  Math.max(320, Math.min(1200, window.innerWidth - 320));

/** A normal layout column; hidden chat stays mounted to keep its stream and draft. */
export const AssistantPanel = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { open, path, close } = useSidePanel();
  const [width, setWidth] = useAtom(sidePanelWidthState);
  const [maxWidth, setMaxWidth] = useState(getMaxWidth);
  useEffect(() => {
    const handleResize = () => setMaxWidth(getMaxWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const allowed = isLoaded && hasActionPermission('agentsChat');
  const visible = open && path === SIDE_PANEL_CHAT_PATH && allowed;
  const everOpened = useRef(false);
  if (visible) everOpened.current = true;

  if (!everOpened.current || !allowed) return null;

  return (
    <RecordSidePanel
      width={width}
      maxWidth={maxWidth}
      onWidthChange={setWidth}
      className={cn(!visible && 'hidden')}
    >
      <Suspense
        fallback={
          <div role="status" className="p-4 text-sm text-muted-foreground">
            {t('loading', 'Loading assistant…')}
          </div>
        }
      >
        <SidePanelChat onClose={close} active={visible} />
      </Suspense>
    </RecordSidePanel>
  );
};
