import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useAtomValue } from 'jotai';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { themeState } from 'erxes-ui/state';
import { COLOR_BY_ID, SHAPE_BY_ID, type ColorId, type ShapeId } from '../bloub/engine/skins';
import {
  EXPRESSION_BY_ID,
  type ExpressionId,
} from '../bloub/engine/expressions';

export interface IAgentBotAppearance {
  shape: ShapeId;
  color: ColorId;
  expression: ExpressionId;
  trayEnabled: boolean;
}

export const AGENT_BOT_APPEARANCE_DEFAULT: IAgentBotAppearance = {
  shape: 'cercle',
  color: 'encre',
  expression: 'neutre',
  trayEnabled: true,
};

/**
 * Validates a stored blob against the catalogues — ids the user no longer
 * has fall back to the defaults instead of breaking the renderer.
 */
export const parseAgentBotAppearance = (
  raw: unknown,
): IAgentBotAppearance => {
  if (!raw || typeof raw !== 'object') {
    return AGENT_BOT_APPEARANCE_DEFAULT;
  }

  const value = raw as Record<string, unknown>;

  return {
    shape:
      typeof value.shape === 'string' && SHAPE_BY_ID.has(value.shape)
        ? (value.shape as ShapeId)
        : AGENT_BOT_APPEARANCE_DEFAULT.shape,
    color:
      typeof value.color === 'string' && COLOR_BY_ID.has(value.color)
        ? (value.color as ColorId)
        : AGENT_BOT_APPEARANCE_DEFAULT.color,
    expression:
      typeof value.expression === 'string' &&
      EXPRESSION_BY_ID.has(value.expression)
        ? (value.expression as ExpressionId)
        : AGENT_BOT_APPEARANCE_DEFAULT.expression,
    trayEnabled:
      typeof value.trayEnabled === 'boolean'
        ? value.trayEnabled
        : AGENT_BOT_APPEARANCE_DEFAULT.trayEnabled,
  };
};

/**
 * Per-device bot appearance: shape, colour, rest expression and whether
 * the floating tray shows. atomWithStorage serializes the raw object, so
 * the validated reader below is the only consumer-safe view.
 */
const agentBotAppearanceStorage = atomWithStorage<unknown>(
  'agent:bot-appearance',
  AGENT_BOT_APPEARANCE_DEFAULT,
  undefined,
  { getOnInit: true },
);

export const agentBotAppearanceState = atom((get) =>
  parseAgentBotAppearance(get(agentBotAppearanceStorage)),
);

/** Write side of the appearance atom (the settings page updates it). */
export const agentBotAppearanceWriteState = atom(
  (get) => parseAgentBotAppearance(get(agentBotAppearanceStorage)),
  (get, set, next: Partial<IAgentBotAppearance>) => {
    set(agentBotAppearanceStorage, {
      ...parseAgentBotAppearance(get(agentBotAppearanceStorage)),
      ...next,
    });
  },
);

const LIGHT_PAPER = '#ffffff';
const DARK_PAPER = '#18181b';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

const subscribeSystemTheme = (onChange: () => void) => {
  const media = window.matchMedia(SYSTEM_DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const getSystemPrefersDark = () =>
  window.matchMedia(SYSTEM_DARK_QUERY).matches;

/**
 * Same resolution as `useResolvedTheme` in app/effect-components —
 * duplicated here because importing that file would drag the whole
 * erxes-ui component barrel into jest for a pure-state module.
 */
export const useResolvedBotTheme = (): 'light' | 'dark' => {
  const theme = useAtomValue(themeState);
  const systemDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemPrefersDark,
  );

  if (theme === 'system') {
    return systemDark ? 'dark' : 'light';
  }
  return theme;
};

/**
 * Paper behind the bot + a colour that survives the theme: `encre` (near
 * black) on a dark plate would vanish, so it swaps to `creme`. Every
 * surface that draws the bot must put `paper` on its own plate.
 */
export const useBotPalette = (): { paper: string; color: ColorId } => {
  const appearance = useAtomValue(agentBotAppearanceState);
  const theme = useResolvedBotTheme();

  const paper = theme === 'dark' ? DARK_PAPER : LIGHT_PAPER;
  const color =
    theme === 'dark' && appearance.color === 'encre'
      ? 'creme'
      : appearance.color;

  return { paper, color };
};

/** `rgb(...)`/`rgba(...)` (commas or modern space syntax) -> '#rrggbb'. */
const cssColorToHex = (value: string): string | null => {
  const match = value.match(
    /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)/,
  );
  if (!match) return null;
  const alpha =
    match[4] === undefined
      ? 1
      : match[4].endsWith('%')
        ? parseFloat(match[4]) / 100
        : parseFloat(match[4]);
  if (!Number.isFinite(alpha) || alpha < 0.5) return null;
  const hex = (n: string | undefined) =>
    Number(n ?? 0)
      .toString(16)
      .padStart(2, '0');
  return `#${hex(match[1])}${hex(match[2])}${hex(match[3])}`;
};

/**
 * The bot's `paper` is the opaque plate the eye holes cut through: when
 * the tray sits directly on the page (no plate of its own), paper must
 * be the real page background or the bot reads as a cut-out sticker.
 */
export const readPageBackground = (): string | null => {
  if (typeof document === 'undefined') return null;
  return (
    cssColorToHex(getComputedStyle(document.body).backgroundColor) ??
    cssColorToHex(getComputedStyle(document.documentElement).backgroundColor)
  );
};

/**
 * `useBotPalette` variant for surfaces with no plate of their own: the
 * tray's paper follows the live page background (re-read whenever the
 * resolved theme or the system scheme flips), falling back to the theme
 * constants when the computed colour is transparent or unparseable.
 */
export const usePageBotPalette = (): { paper: string; color: ColorId } => {
  const { paper: themePaper, color } = useBotPalette();
  const theme = useResolvedBotTheme();
  const [paper, setPaper] = useState(
    () => readPageBackground() ?? themePaper,
  );

  useEffect(() => {
    const update = () =>
      setPaper(readPageBackground() ?? themePaper);
    update();
    const media = window.matchMedia(SYSTEM_DARK_QUERY);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [theme, themePaper]);

  return { paper, color };
};
