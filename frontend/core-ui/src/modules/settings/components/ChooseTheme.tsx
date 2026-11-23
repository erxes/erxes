import { IconCheck, IconMinus } from '@tabler/icons-react';
import { RadioGroup, ThemeOption, themeState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const items = [
  {
    id: 'radio-18-r1',
    value: 'light',
    label: 'Light',
    image: '/assets/ui-light.webp',
  },
  {
    id: 'radio-18-r2',
    value: 'dark',
    label: 'Dark',
    image: '/assets/ui-dark.webp',
  },
  {
    id: 'radio-18-r3',
    value: 'system',
    label: 'System',
    image: '/assets/ui-system.webp',
  },
];

export function ChooseTheme() {
  const [theme, setTheme] = useAtom(themeState);
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold leading-none text-foreground">
        {t('appearance')}
      </legend>
      <RadioGroup
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        value={theme}
        onValueChange={(value) => setTheme(value as ThemeOption)}
      >
        {items.map((item) => (
          <label
            key={item.id}
            className="group/theme relative flex cursor-pointer flex-col"
          >
            <RadioGroup.Item
              id={item.id}
              value={item.value}
              className="peer sr-only after:absolute after:inset-0"
            />
            <span className="relative block overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-1 shadow-2xs ring-offset-background transition-[transform,border-color,box-shadow] duration-200 group-hover/theme:-translate-y-0.5 group-hover/theme:border-primary/40 group-hover/theme:shadow-md active:scale-[0.985] peer-focus-visible:ring-2 peer-focus-visible:ring-ring/70 peer-focus-visible:ring-offset-2 peer-data-disabled:cursor-not-allowed peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/20 peer-data-disabled:opacity-50">
              <img
                src={item.image}
                alt={item.label}
                width={180}
                height={96}
                className="h-24 w-full rounded-lg object-cover transition-transform duration-300 group-hover/theme:scale-[1.03]"
              />
            </span>
            <span className="group mt-2.5 flex items-center gap-1.5 peer-data-[state=unchecked]:text-muted-foreground">
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground in-[.group]:peer-data-[state=unchecked]:hidden">
                <IconCheck size={11} stroke={2.5} aria-hidden="true" />
              </span>
              <span className="flex size-4 items-center justify-center rounded-full border border-border/80 text-muted-foreground/70 in-[.group]:peer-data-[state=checked]:hidden">
                <IconMinus size={11} aria-hidden="true" />
              </span>

              <span className="text-xs font-medium">{item.label}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
