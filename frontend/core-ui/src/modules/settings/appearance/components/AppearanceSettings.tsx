import { IconCalendarEvent } from '@tabler/icons-react';
import { ToggleGroup, cn } from 'erxes-ui';
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
  'h-auto gap-2 rounded-lg border py-1.5 pr-3 pl-1.5 data-[state=on]:border-primary data-[state=on]:ring-1 data-[state=on]:ring-primary';

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
        'flex h-24 w-full overflow-hidden rounded-md border bg-background',
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
          'flex size-5 items-center justify-center rounded-full border border-foreground/10',
          swatchProps(color).className,
        )}
        style={swatchProps(color).style}
      >
        {color === 'seasonal' && <IconCalendarEvent className="size-3" />}
      </span>
      <span className="text-sm">{t(`notch-${color}`)}</span>
    </ToggleGroup.Item>
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
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
          className="grid grid-cols-3 gap-3"
          type="single"
          value={appearance.layout}
          onValueChange={(value) => {
            if (isAppearanceLayout(value)) {
              setAppearance({ layout: value });
            }
          }}
        >
          {APPEARANCE_LAYOUTS.map((layout) => (
            <ToggleGroup.Item
              key={layout}
              value={layout}
              className="h-auto flex-col items-stretch gap-2 rounded-lg border p-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:ring-1 data-[state=on]:ring-primary"
            >
              <LayoutPreview
                layout={layout}
                frame={frame}
                navPosition={appearance.navPosition}
              />
              <span className="text-sm font-medium">
                {t(`appearance-${layout}`)}
              </span>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </section>

      {positionLabels && (
        <section className="space-y-3">
          <div>
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
            className="flex justify-start gap-3"
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
                  <span className="px-1.5 text-sm">
                    {t(`appearance-position-${label}`)}
                  </span>
                </ToggleGroup.Item>
              );
            })}
          </ToggleGroup>
        </section>
      )}

      <section className="space-y-3">
        <div>
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
          className="flex flex-wrap justify-start gap-3"
          disabled={frameDisabled}
          type="single"
          value={appearance.frameColor}
          onValueChange={onFrameChange}
        >
          {COLORS.map(renderSwatch)}
        </ToggleGroup>
        <div className="space-y-2 pt-2">
          <p className="text-sm text-muted-foreground">
            {t(
              'appearance-themes-description',
              'Animated themes. Seasonal switches to New Year and March 8 on their dates.',
            )}
          </p>
          <ToggleGroup
            className="flex flex-wrap justify-start gap-3"
            disabled={frameDisabled}
            type="single"
            value={appearance.frameColor}
            onValueChange={onFrameChange}
          >
            {THEMES.map(renderSwatch)}
          </ToggleGroup>
        </div>
      </section>
    </div>
  );
};
