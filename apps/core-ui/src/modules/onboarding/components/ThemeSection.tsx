import { Button, cn, type ThemeOption, themeState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import uiDark from '../assets/ui-dark.webp';
import uiLight from '../assets/ui-light.webp';
import uiSystem from '../assets/ui-system.webp';
import { Appear, EASE_OUT_QUAD } from './Appear';

const THEME_OPTIONS: { value: ThemeOption; labelKey: string; src: string }[] = [
  { value: 'system', labelKey: 'theme-system', src: uiSystem },
  { value: 'light', labelKey: 'theme-light', src: uiLight },
  { value: 'dark', labelKey: 'theme-dark', src: uiDark },
];

export const ThemeSection = ({ onContinue }: { onContinue: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const [theme, setTheme] = useAtom(themeState);

  return (
    <Appear
      y={50}
      duration={600}
      easing={EASE_OUT_QUAD}
      className="flex w-full flex-col gap-10 px-4 sm:-translate-y-10"
    >
      <Appear y={20} duration={500} delay={200} className="flex flex-col gap-2 items-center">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">
          {t('choose-theme')}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
          {t('choose-theme-description')}
        </p>
      </Appear>
      <Appear y={20} duration={1000} delay={400} className="grid w-full grid-cols-3 gap-3 sm:gap-6">
        {THEME_OPTIONS.map(({ value, labelKey, src }) => (
          <div key={value} className="flex flex-col gap-2 items-center">
            <div
              className={cn(
                'aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-lg bg-muted transition-all',
                theme === value
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'hover:shadow-md',
              )}
            >
              <button
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className="h-full w-full cursor-pointer select-none rounded-lg"
              >
                <img
                  src={src}
                  alt={t('theme-alt', { label: t(labelKey) })}
                  draggable={false}
                  className="h-full w-full rounded-lg object-cover"
                />
              </button>
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                theme === value ? 'text-primary-text' : 'text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {t(labelKey)}
            </span>
          </div>
        ))}
      </Appear>
      <Appear
        y={20}
        scale={0.95}
        duration={600}
        delay={600}
        className="w-full px-6 sm:px-12 lg:px-20"
      >
        <Button
          className="w-full cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
          variant="secondary"
          onClick={onContinue}
        >
          {t('continue')}
        </Button>
      </Appear>
    </Appear>
  );
};
