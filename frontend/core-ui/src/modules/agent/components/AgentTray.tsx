import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Tooltip, useIsMobile } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useLocation } from 'react-router-dom';
import { usePermissionCheck } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import { BloubAvatar } from '../bloub/BloubAvatar';
import { COLOR_BY_ID } from '../bloub/engine/skins';
import {
  agentBotAppearanceState,
  usePageBotPalette,
  useResolvedBotTheme,
} from '../states/agentBotAppearanceState';
import { agentActivityState } from '../states/agentActivityState';
import {
  agentSidePanelOpenState,
  agentSidePanelWidthState,
  agentTrayPositionState,
} from '../states/agentPanelStates';
import { botStatusKey, useBotDirector } from '../utils/botDirector';
import { trayGlow } from '../utils/trayGlow';
import {
  clampTrayTop,
  ratioToTop,
  snapTraySide,
  topToRatio,
  trayLeft,
  TRAY_DRAG_THRESHOLD,
  TRAY_PANEL_GAP,
  TRAY_SIZE,
} from '../utils/trayPosition';

interface IDragSession {
  startX: number;
  startY: number;
  moved: boolean;
}

/**
 * The floating agent bot: a transparent 52px hit target that docks to a
 * screen edge, carries a status glow behind the bot, follows the chat's
 * activity through `useBotDirector`, and opens the side panel on click
 * or `mod+j`.
 */
export const AgentTray = () => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const appearance = useAtomValue(agentBotAppearanceState);
  const activity = useAtomValue(agentActivityState);
  const { paper, color } = usePageBotPalette();
  const dark = useResolvedBotTheme() === 'dark';
  const [open, setOpen] = useAtom(agentSidePanelOpenState);
  const panelWidth = useAtomValue(agentSidePanelWidthState);
  const [position, setPosition] = useAtom(agentTrayPositionState);
  const reducedMotion = useReducedMotion();

  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [justDroppedAt, setJustDroppedAt] = useState<number | null>(null);
  const [panelOpenedAt, setPanelOpenedAt] = useState<number | null>(null);
  const [triplePressedAt, setTriplePressedAt] = useState<number | null>(
    null,
  );

  const dragRef = useRef<IDragSession | null>(null);
  const suppressClickRef = useRef(false);
  const clicksRef = useRef<number[]>([]);
  const wasOpenRef = useRef(open);

  const allowed = isLoaded && hasActionPermission('agentsChat');

  const director = useBotDirector(
    { hovering, dragging, justDroppedAt, panelOpenedAt, triplePressedAt },
    appearance.expression,
  );

  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // `swirl` once when the panel opens — the bot notices you came to it.
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setPanelOpenedAt(Date.now());
    }
    wasOpenRef.current = open;
  }, [open]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const session = dragRef.current;
    if (!session) return;

    const dx = event.clientX - session.startX;
    const dy = event.clientY - session.startY;

    if (!session.moved && Math.hypot(dx, dy) < TRAY_DRAG_THRESHOLD) {
      return;
    }
    if (!session.moved) {
      session.moved = true;
      setDragging(true);
      suppressClickRef.current = true;
    }
    setDragPos({
      x: event.clientX - TRAY_SIZE / 2,
      y: event.clientY - TRAY_SIZE / 2,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const session = dragRef.current;
    dragRef.current = null;

    if (!session?.moved) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const side = snapTraySide(event.clientX, viewport.width);
    const top = clampTrayTop(
      event.clientY - TRAY_SIZE / 2,
      viewport.height,
    );

    setPosition({ side, yRatio: topToRatio(top, viewport.height) });
    setDragPos(null);
    setDragging(false);
    setJustDroppedAt(Date.now());
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const now = Date.now();
    clicksRef.current = [...clicksRef.current, now].filter(
      (at) => now - at < 500,
    );
    if (clicksRef.current.length >= 3) {
      clicksRef.current = [];
      setTriplePressedAt(now);
    }

    setOpen(!open);
  };

  const status = botStatusKey(activity, director.state);
  const statusLabel = t(status.key, {
    count: status.count,
    defaultValue: status.defaultValue,
  });

  if (!allowed || !appearance.trayEnabled || pathname.startsWith('/agent')) {
    return null;
  }
  if (isMobile && open) {
    return null;
  }

  const side = position.side;
  const restingLeft = trayLeft(
    side,
    viewport.width,
    open && !isMobile && side === 'right'
      ? panelWidth + TRAY_PANEL_GAP
      : 0,
  );
  const restingTop = ratioToTop(position.yRatio, viewport.height);

  const left = dragPos?.x ?? restingLeft;
  const top = dragPos?.y ?? restingTop;

  const glow = trayGlow({
    state: director.state,
    dragging,
    hovering,
    dark,
    botColor: COLOR_BY_ID.get(color)?.hex ?? color,
  });

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="fixed z-40 flex items-center justify-center rounded-full bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{
              width: TRAY_SIZE,
              height: TRAY_SIZE,
              left,
              top,
              transition:
                dragging || reducedMotion
                  ? 'none'
                  : 'left 180ms ease, top 180ms ease',
            }}
            aria-label={`${statusLabel} (⌘J)`}
            title={statusLabel}
            aria-expanded={open}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleClick}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
          >
            <span className="relative block size-11">
              {glow && (
                <span
                  className="pointer-events-none absolute -inset-2 rounded-full"
                  style={{ opacity: glow.opacity }}
                  aria-hidden="true"
                >
                  <span
                    key={`${director.state}-${director.restartKey}`}
                    className="agent-tray-glow absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${glow.color} 0%, ${glow.color}00 68%)`,
                      filter: 'blur(3px)',
                      animation:
                        glow.animation === 'steady'
                          ? 'none'
                          : `tray-glow-${glow.animation} ${glow.durationMs}ms ease-out ${
                              glow.animation === 'pulse' ? 'infinite' : 'forwards'
                            }`,
                    }}
                  />
                </span>
              )}
              <BloubAvatar
                size={44}
                state={director.state}
                expression={
                  director.expression ?? appearance.expression
                }
                shape={appearance.shape}
                color={color}
                paper={paper}
                follow={director.follow}
                restartKey={director.restartKey}
                cycle={director.showcase}
                playing={Boolean(director.showcase)}
                onCycleEnd={director.onShowcaseEnd}
                aria-label={statusLabel}
                className="relative block"
              />
              {activity.unread > 0 && (
                <span
                  className="pointer-events-none absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground"
                  aria-hidden="true"
                >
                  {activity.unread > 9 ? '9+' : activity.unread}
                </span>
              )}
            </span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content side={side === 'right' ? 'left' : 'right'}>
          {statusLabel}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
