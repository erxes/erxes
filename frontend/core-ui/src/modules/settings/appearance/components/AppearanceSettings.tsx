import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { IconCalendarEvent, IconCheck } from '@tabler/icons-react';
import { ToggleGroup, cn } from 'erxes-ui';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  APPEARANCE_LAYOUTS,
  AppearanceLayout,
  FRAME_COLORS,
  FRAME_THEMES,
  FrameColor,
  FrameStyle,
  NAV_POSITIONS,
  NavPosition,
  frameFillVars,
  isAppearanceLayout,
  isFrameColor,
  isNavPosition,
  resolveFrameStyle,
} from '@/app/constants/appearance';
import { useAppearance } from '@/app/hooks/useAppearance';

const COLORS = Object.keys(FRAME_COLORS) as FrameColor[];
const THEMES: FrameColor[] = [
  ...(Object.keys(FRAME_THEMES) as FrameColor[]),
  'seasonal',
];

// Swatches follow the current theme like the frame, unless a theme has its own.
const swatchProps = (color: FrameColor) => {
  const style = resolveFrameStyle(color);

  return style.swatch
    ? { className: '', style: { background: style.swatch } }
    : { className: 'frame-fill', style: frameFillVars(style) };
};

// Position labels name the actual edge for the chosen layout.
const POSITION_LABELS: Record<
  'notch' | 'sidebar',
  Record<NavPosition, string>
> = {
  notch: { start: 'top', end: 'bottom' },
  sidebar: { start: 'left', end: 'right' },
};

const swatchClassName =
  'group/swatch h-auto gap-2 rounded-xl border border-border/80 bg-background/80 py-1.5 pr-3 pl-1.5 shadow-2xs transition-[transform,border-color,background-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs active:scale-95 data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:ring-2 data-[state=on]:ring-primary/20';

const settingsCardClassName =
  'space-y-4 rounded-2xl border border-border/75 bg-background/95 p-5 shadow-2xs backdrop-blur-xs';

// A thumbnail of the shell: navigation bar or rail plus the app area.
const LayoutPreview = ({
  layout,
  frame,
  navPosition,
}: {
  layout: AppearanceLayout;
  frame: FrameStyle;
  navPosition: NavPosition;
}) => {
  const framed = layout !== 'default';
  const atEnd = framed && navPosition === 'end';

  return (
    <div
      className={cn(
        'flex h-24 w-full overflow-hidden rounded-lg border border-border/70 bg-background shadow-2xs transition-transform duration-200 group-hover/layout-card:scale-[1.015]',
        framed && 'frame-fill',
        layout === 'sidebar' && (atEnd ? 'flex-row-reverse' : 'flex-row'),
        layout !== 'sidebar' && (atEnd ? 'flex-col-reverse' : 'flex-col'),
      )}
      style={framed ? frameFillVars(frame) : undefined}
    >
      <div
        className={cn(
          'flex shrink-0 gap-1 p-1.5',
          layout === 'sidebar'
            ? 'w-5 flex-col items-center'
            : 'h-5 items-center',
          !framed && 'border-b bg-sidebar',
        )}
      >
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className={cn(
              'rounded-sm',
              layout === 'sidebar' ? 'size-2' : 'h-2 w-6',
              framed ? 'bg-white/40' : 'bg-muted-foreground/30',
            )}
          />
        ))}
      </div>
      <div
        className={cn(
          'flex-1 bg-background p-2',
          framed && 'rounded-sm',
          layout === 'notch' && (atEnd ? 'mx-1 mt-1' : 'mx-1 mb-1'),
          layout === 'sidebar' && (atEnd ? 'my-1 ml-1' : 'my-1 mr-1'),
        )}
      >
        <span className="block h-2 w-1/2 rounded-sm bg-muted" />
        <span className="mt-1.5 block h-2 w-3/4 rounded-sm bg-muted" />
      </div>
    </div>
  );
};

export const AppearanceSettings = () => {
  const { t } = useTranslation('organization');
  const { appearance, setAppearance } = useAppearance();
  const prefersReducedMotion = useReducedMotion();
  const frame = resolveFrameStyle(appearance.frameColor);
  const frameDisabled = appearance.layout === 'default';
  const positionLabels =
    appearance.layout === 'default' ? null : POSITION_LABELS[appearance.layout];

  const onFrameChange = (value: string) => {
    if (isFrameColor(value)) {
      setAppearance({ frameColor: value });
    }
  };

  const renderSwatch = (color: FrameColor) => (
    <ToggleGroup.Item key={color} value={color} className={swatchClassName}>
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded-full border border-foreground/15 shadow-2xs transition-transform duration-150 group-hover/swatch:scale-110',
          swatchProps(color).className,
        )}
        style={swatchProps(color).style}
      >
        {color === 'seasonal' && <IconCalendarEvent className="size-3" />}
      </span>
      <span className="text-sm font-medium">{t(`notch-${color}`)}</span>
    </ToggleGroup.Item>
  );

  return (
    <div className="space-y-5">
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: NAVIGATION_EASE }}
        className={settingsCardClassName}
      >
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            {t('appearance-layout', 'Layout')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'appearance-layout-description',
              'Where the app tabs sit. Saved to your account, so it follows you to every device.',
            )}
          </p>
        </div>
        <ToggleGroup
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          type="single"
          value={appearance.layout}
          onValueChange={(value) => {
            if (isAppearanceLayout(value)) {
              setAppearance({ layout: value });
            }
          }}
        >
          {APPEARANCE_LAYOUTS.map((layout) => {
            const selected = appearance.layout === layout;

            return (
              <ToggleGroup.Item
                key={layout}
                value={layout}
                className="group/layout-card relative h-auto flex-col items-stretch gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-2.5 transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm active:scale-[0.985] data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:shadow-xs data-[state=on]:ring-2 data-[state=on]:ring-primary/20"
              >
                <LayoutPreview
                  layout={layout}
                  frame={frame}
                  navPosition={appearance.navPosition}
                />
                <span className="flex items-center justify-center gap-1.5 text-sm font-medium">
                  {selected && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <IconCheck className="size-2.5" stroke={3} />
                    </span>
                  )}
                  <span>{t(`appearance-${layout}`)}</span>
                </span>
              </ToggleGroup.Item>
            );
          })}
        </ToggleGroup>
      </motion.section>

      <AnimatePresence initial={false}>
        {positionLabels && (
          <motion.section
            key="appearance-position"
            initial={
              prefersReducedMotion ? false : { opacity: 0, y: -6, scale: 0.99 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: -6, scale: 0.99 }
            }
            transition={{ duration: 0.22, ease: NAVIGATION_EASE }}
            className={settingsCardClassName}
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">
                {t('appearance-position', 'Position')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  'appearance-position-description',
                  'Which edge of the frame the app tabs sit on.',
                )}
              </p>
            </div>
            <ToggleGroup
              className="flex justify-start gap-2.5"
              type="single"
              value={appearance.navPosition}
              onValueChange={(value) => {
                if (isNavPosition(value)) {
                  setAppearance({ navPosition: value });
                }
              }}
            >
              {NAV_POSITIONS.map((position) => {
                const label = positionLabels[position];

                return (
                  <ToggleGroup.Item
                    key={position}
                    value={position}
                    className={swatchClassName}
                  >
                    <span className="px-2 text-sm font-medium">
                      {t(`appearance-position-${label}`)}
                    </span>
                  </ToggleGroup.Item>
                );
              })}
            </ToggleGroup>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06, ease: NAVIGATION_EASE }}
        className={cn(settingsCardClassName, frameDisabled && 'opacity-70')}
      >
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            {t('appearance-notch-color', 'Frame color')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {appearance.layout === 'default'
              ? t(
                  'appearance-frame-color-default',
                  'Used by the Notch and Sidebar layouts.',
                )
              : t(
                  'appearance-frame-color-description',
                  'The color around the app.',
                )}
          </p>
        </div>
        <ToggleGroup
          className="flex flex-wrap justify-start gap-2.5"
          disabled={frameDisabled}
          type="single"
          value={appearance.frameColor}
          onValueChange={onFrameChange}
        >
          {COLORS.map(renderSwatch)}
        </ToggleGroup>
        <div className="space-y-2.5 border-t border-border/60 pt-4">
          <p className="text-sm text-muted-foreground">
            {t(
              'appearance-themes-description',
              'Animated themes. Seasonal switches to New Year and March 8 on their dates.',
            )}
          </p>
          <ToggleGroup
            className="flex flex-wrap justify-start gap-2.5"
            disabled={frameDisabled}
            type="single"
            value={appearance.frameColor}
            onValueChange={onFrameChange}
          >
            {THEMES.map(renderSwatch)}
          </ToggleGroup>
        </div>
      </motion.section>
    </div>
  );
};
