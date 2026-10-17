import { IconPalette } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Label,
  Separator,
  Switch,
  toast,
  ToggleGroup,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';

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
import { agentTrayPositionState } from '@/agent/states/agentPanelStates';
import { defaultTrayPosition } from '@/agent/utils/trayPosition';

interface IBotThumbProps {
  size: number;
  state: StateId;
  shape?: ShapeId;
  color?: ColorId;
  expression?: ExpressionId;
  /** Always frozen — pickers stay cheap. */
  frozenAt: number;
}

/**
 * Per-device bot appearance: shape, colour, rest expression, and whether
 * the floating tray shows. Nothing here touches the server — the
 * preference lives in localStorage, hence the "Saved on this device"
 * note under the title.
 */
export const AgentSettingsAppearancePage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const appearance = useAtomValue(agentBotAppearanceState);
  const setAppearance = useSetAtom(agentBotAppearanceWriteState);
  const setTrayPosition = useSetAtom(agentTrayPositionState);
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

  const BotThumb = ({
    size,
    state,
    shape,
    color: thumbColor,
    expression,
    frozenAt,
  }: IBotThumbProps) => (
    <span
      className="inline-flex items-center justify-center overflow-hidden rounded-full"
      style={{ background: paper }}
    >
      <BloubAvatar
        size={size}
        state={state}
        shape={shape ?? appearance.shape}
        color={thumbColor ?? color}
        expression={expression ?? appearance.expression}
        paper={paper}
        frozenAt={frozenAt}
        role="presentation"
      />
    </span>
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/agent">
                    <IconPalette />
                    {t('title', 'AI Agent')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/agent">
                    {t('settings', 'Settings')}
                  </Link>
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
                  <BotThumb size={40} state="idle" shape={id} frozenAt={POSES.idle} />
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
              <div className="space-y-1.5">
                <Label className="font-sans text-sm font-medium normal-case">
                  {t('appearance-show-tray', 'Show floating assistant')}
                </Label>
                <p className="max-w-sm text-xs text-muted-foreground">
                  {t(
                    'appearance-show-tray-hint',
                    'The movable bot that follows the chat and opens the panel.',
                  )}
                </p>
              </div>
              <Switch
                checked={appearance.trayEnabled}
                onCheckedChange={(checked) =>
                  setAppearance({ trayEnabled: checked })
                }
                aria-label={t('appearance-show-tray', 'Show floating assistant')}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setTrayPosition(defaultTrayPosition(window.innerHeight));
                toast({
                  title: t('appearance-reset-done', 'Tray position reset'),
                });
              }}
            >
              {t('appearance-reset-tray', 'Reset tray position')}
            </Button>
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
                  <BotThumb size={40} state={id} frozenAt={POSES[id]} />
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
