import { motion, useReducedMotion } from 'framer-motion';
import { useAtom } from 'jotai';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'erxes-ui';
import { RecordSidePanel, usePermissionCheck } from 'ui-modules';

import {
  agentPanelModeState,
  assistantPanelWidthState,
} from '@/agent/states/agentPanelStates';
import { useGlobalSidebar } from '@/global-sidebar/hooks/useGlobalSidebar';

const SidePanelChat = lazy(() =>
  import('./SidePanelChat').then((module) => ({
    default: module.SidePanelChat,
  })),
);

const LENS_WIDTH = 440;

// Leave room for the workspace while allowing a much wider transcript.
const getMaxWidth = () =>
  Math.max(320, Math.min(1200, window.innerWidth - 320));

/** Global sidebar tool: floating Lens or docked Companion; the chat stays mounted in both. */
export const AssistantPanel = () => {
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { tool, close } = useGlobalSidebar();
  const [width, setWidth] = useAtom(assistantPanelWidthState);
  const [mode, setMode] = useAtom(agentPanelModeState);
  const [maxWidth, setMaxWidth] = useState(getMaxWidth);
  useEffect(() => {
    const handleResize = () => setMaxWidth(getMaxWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const allowed = isLoaded && hasActionPermission('agentsChat');
  const visible = tool === 'assistant' && allowed;
  const lens = mode === 'lens';
  const everOpened = useRef(false);
  if (visible) everOpened.current = true;

  if (!everOpened.current || !allowed) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{
        width: visible ? 'auto' : 0,
        opacity: visible ? 1 : 0,
        y: visible ? 0 : lens ? -8 : 0,
      }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
      aria-hidden={!visible}
      data-agent-panel-mode={mode}
      {...(!visible ? { inert: '' } : {})}
      className={cn(
        'flex min-h-0 shrink-0 overflow-hidden',
        lens
          ? 'fixed right-4 top-14 z-40 max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto'
          : 'max-sm:fixed max-sm:inset-0 max-sm:z-40',
      )}
    >
      <RecordSidePanel
        width={lens ? LENS_WIDTH : width}
        maxWidth={lens ? LENS_WIDTH : maxWidth}
        onWidthChange={lens ? undefined : setWidth}
        className={cn(
          'animate-none',
          lens
            ? 'h-[min(720px,calc(100svh-5rem))] rounded-2xl border shadow-2xl max-sm:h-[85svh] max-sm:rounded-b-none'
            : 'max-sm:h-svh',
        )}
      >
        <Suspense
          fallback={
            <div role="status" className="p-4 text-sm text-muted-foreground">
              {t('loading', 'Loading assistant…')}
            </div>
          }
        >
          <SidePanelChat
            onClose={close}
            active={visible}
            mode={mode}
            onModeChange={setMode}
          />
        </Suspense>
      </RecordSidePanel>
    </motion.div>
  );
};
