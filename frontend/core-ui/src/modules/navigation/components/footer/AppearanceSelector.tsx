import { ToggleGroup, Tooltip, cn } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  AppearanceLayout,
  appearanceLayoutState,
  NOTCH_COLORS,
  NotchColor,
  notchColorState,
} from '@/app/states/appearanceState';

const LAYOUTS: AppearanceLayout[] = ['default', 'notch'];
const COLORS = Object.keys(NOTCH_COLORS) as NotchColor[];

const isLayout = (value: string): value is AppearanceLayout =>
  LAYOUTS.includes(value as AppearanceLayout);

const isNotchColor = (value: string): value is NotchColor =>
  value in NOTCH_COLORS;

const itemClassName =
  'h-full px-2 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm';

export const AppearanceSelector = () => {
  const [layout, setLayout] = useAtom(appearanceLayoutState);
  const [notchColor, setNotchColor] = useAtom(notchColorState);
  const { t } = useTranslation('organization');

  return (
    <div className="space-y-1">
      <div className="flex h-7 items-center gap-2 px-2 text-sm font-medium">
        {t('appearance', 'Appearance')}
        <ToggleGroup
          className="ml-auto h-6 gap-0.5 rounded bg-accent text-accent-foreground"
          onValueChange={(value) => {
            if (value && isLayout(value)) {
              setLayout(value);
            }
          }}
          size="sm"
          type="single"
          value={layout}
        >
          <ToggleGroup.Item className={itemClassName} value="default">
            {t('appearance-default', 'Default')}
          </ToggleGroup.Item>
          <ToggleGroup.Item className={itemClassName} value="notch">
            {t('appearance-notch', 'Notch')}
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>
      {layout === 'notch' && (
        <Tooltip.Provider delayDuration={100}>
          <ToggleGroup
            aria-label={t('appearance-notch-color', 'Notch color')}
            className="flex h-7 justify-end gap-1.5 px-2"
            onValueChange={(value) => {
              if (value && isNotchColor(value)) {
                setNotchColor(value);
              }
            }}
            type="single"
            value={notchColor}
          >
            {COLORS.map((color) => (
              <Tooltip key={color}>
                <ToggleGroup.Item
                  asChild
                  aria-label={t(`notch-${color}`, color)}
                  className={cn(
                    'size-5 min-w-5 rounded-full p-0 ring-offset-2 ring-offset-background',
                    'data-[state=on]:ring-2 data-[state=on]:ring-ring',
                  )}
                  style={{ background: NOTCH_COLORS[color] }}
                  value={color}
                >
                  <Tooltip.Trigger />
                </ToggleGroup.Item>
                <Tooltip.Content>{t(`notch-${color}`, color)}</Tooltip.Content>
              </Tooltip>
            ))}
          </ToggleGroup>
        </Tooltip.Provider>
      )}
    </div>
  );
};
