import { IconPalette } from '@tabler/icons-react';
import { Breadcrumb, Button, Label, Separator, ToggleGroup } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, SIDE_PANEL_CHAT_PATH, useSidePanel } from 'ui-modules';

import { BloubAvatar } from '@/agent/bloub/BloubAvatar';
import { defaultCycle } from '@/agent/bloub/engine/cycles';
import {
  EXPRESSIONS,
  type ExpressionId,
} from '@/agent/bloub/engine/expressions';
import {
  COLORS,
  SHAPES,
  type ColorId,
  type ShapeId,
} from '@/agent/bloub/engine/skins';
import { POSES, SEQUENCE, type StateId } from '@/agent/bloub/engine/states';
import {
  agentBotAppearanceState,
  agentBotAppearanceWriteState,
  useBotPalette,
} from '@/agent/states/agentBotAppearanceState';

interface IBotThumbProps {
  size: number;
  state: StateId;
  shape?: ShapeId;
  color?: ColorId;
  expression?: ExpressionId;
  /** Always frozen — pickers stay cheap. */
  frozenAt: number;
}

const BotThumb = ({
  paper,
  appearance,
  paletteColor,
  size,
  state,
  shape,
  color: thumbColor,
  expression,
  frozenAt,
}: IBotThumbProps & {
  paper: string;
  appearance: { shape: ShapeId; expression: ExpressionId };
  paletteColor: ColorId;
}) => (
  <span
    className="inline-flex items-center justify-center overflow-hidden rounded-full"
    style={{ background: paper }}
  >
    <BloubAvatar
      size={size}
      state={state}
      shape={shape ?? appearance.shape}
      color={thumbColor ?? paletteColor}
      expression={expression ?? appearance.expression}
      paper={paper}
      frozenAt={frozenAt}
      role="presentation"
    />
  </span>
);

/**
 * Per-device chat bot appearance: shape, colour, and rest expression.
 * Preferences live in localStorage, hence the "Saved on this device" note.
 */
export const AgentSettingsAppearancePage = () => {
  const { openPath } = useSidePanel();
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const appearance = useAtomValue(agentBotAppearanceState);
  const setAppearance = useSetAtom(agentBotAppearanceWriteState);
  const { paper, color } = useBotPalette();

  // Preview playback: a picked gallery state plays through the live
  // preview once; "Play all" runs the measured default cycle.
  const [previewState, setPreviewState] = useState<StateId>('idle');
  const [previewKey, setPreviewKey] = useState(0);
  const [playingAll, setPlayingAll] = useState(false);
  const allBlocks = useMemo(() => defaultCycle().blocks, []);

  const playState = (state: StateId) => {
    setPlayingAll(false);
    setPreviewState(state);
    setPreviewKey((key) => key + 1);
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button
                  variant="ghost"
                  onClick={() => openPath(SIDE_PANEL_CHAT_PATH)}
                >
                  <IconPalette />
                  {t('assistant', 'Assistant')}
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/agent">{t('settings', 'Settings')}</Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">
                  {t('appearance', 'Appearance')}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={['AI Agent', 'Settings', 'Appearance']}
            icon="IconPalette"
          />
        </PageHeader.Start>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl space-y-4 p-6">
          <p className="text-xs text-muted-foreground">
            {t('appearance-saved-locally', 'Saved on this device')}
          </p>

          <div className="rounded-xl border p-6">
            <Label className="font-sans text-sm font-medium normal-case">
              {t('appearance-preview', 'Preview')}
            </Label>
            <div className="mt-4 flex items-center justify-center">
              <span
                className="inline-flex items-center justify-center overflow-hidden rounded-full"
                style={{ background: paper }}
              >
                <BloubAvatar
                  size={160}
                  state={previewState}
                  shape={appearance.shape}
                  color={color}
                  expression={appearance.expression}
                  paper={paper}
                  follow={!playingAll}
                  restartKey={previewKey}
                  cycle={playingAll ? allBlocks : undefined}
                  playing={playingAll}
                  onCycleEnd={() => {
                    setPlayingAll(false);
                    setPreviewState('idle');
                  }}
                  aria-label={t('nav-label', 'AI Agent')}
                />
              </span>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <Label className="font-sans text-sm font-medium normal-case">
              {t('appearance-shape', 'Shape')}
            </Label>
            <ToggleGroup
              type="single"
              value={appearance.shape}
              onValueChange={(value) => {
                if (value) setAppearance({ shape: value as ShapeId });
              }}
              className="mt-4 flex-wrap justify-start"
            >
              {SHAPES.map(({ id }) => (
                <ToggleGroup.Item
                  key={id}
                  value={id}
                  className="h-auto p-2"
                  aria-label={t(`shape-${id}`)}
                >
                  <BotThumb
                    paper={paper}
                    appearance={appearance}
                    paletteColor={color}
                    size={40}
                    state="idle"
                    shape={id}
                    frozenAt={POSES.idle}
                  />
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </div>

          <div className="rounded-xl border p-6">
            <Label className="font-sans text-sm font-medium normal-case">
              {t('appearance-color', 'Colour')}
            </Label>
            <ToggleGroup
              type="single"
              value={appearance.color}
              onValueChange={(value) => {
                if (value) setAppearance({ color: value as ColorId });
              }}
              className="mt-4 flex-wrap justify-start"
            >
              {COLORS.map(({ id, hex }) => (
                <ToggleGroup.Item
                  key={id}
                  value={id}
                  className="h-auto p-2"
                  aria-label={t(`color-${id}`)}
                >
                  <span
                    className="size-6 rounded-full border"
                    style={{ background: hex }}
                  />
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </div>

          <div className="rounded-xl border p-6">
            <Label className="font-sans text-sm font-medium normal-case">
              {t('appearance-expression', 'Rest expression')}
            </Label>
            <ToggleGroup
              type="single"
              value={appearance.expression}
              onValueChange={(value) => {
                if (value) setAppearance({ expression: value as ExpressionId });
              }}
              className="mt-4 flex-wrap justify-start"
            >
              {EXPRESSIONS.map(({ id }) => (
                <ToggleGroup.Item
                  key={id}
                  value={id}
                  className="h-auto p-2"
                  aria-label={t(`expression-${id}`)}
                >
                  <BotThumb
                    paper={paper}
                    appearance={appearance}
                    paletteColor={color}
                    size={40}
                    state="idle"
                    expression={id}
                    frozenAt={POSES.idle}
                  />
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </div>

          <div className="rounded-xl border p-6">
            <div className="flex items-start justify-between gap-4">
              <Label className="font-sans text-sm font-medium normal-case">
                {t('appearance-animations', 'Animations')}
              </Label>
              <Button
                variant="outline"
                size="sm"
                disabled={playingAll}
                onClick={() => setPlayingAll(true)}
              >
                {t('appearance-play-all', 'Play all')}
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {SEQUENCE.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-muted"
                  onClick={() => playState(id)}
                  aria-label={t(`state-${id}`)}
                >
                  <BotThumb
                    paper={paper}
                    appearance={appearance}
                    paletteColor={color}
                    size={40}
                    state={id}
                    frozenAt={POSES[id]}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {t(`state-${id}`)}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t(
                'appearance-animations-hint',
                'Click a state to play it in the preview.',
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
