import { IconCheck, IconMinus } from '@tabler/icons-react';

import { RadioGroup } from 'erxes-ui';
import { useAtom } from 'jotai';
import { ThemeOption, themeState } from 'erxes-ui';

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

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium leading-none text-foreground">
        Appearance
      </legend>
      <RadioGroup
        className="flex gap-4"
        value={theme}
        onValueChange={(value) => setTheme(value as ThemeOption)}
      >
        {items.map((item) => (
          <label key={item.id}>
            <RadioGroup.Item
              id={item.id}
              value={item.value}
              className="peer sr-only after:absolute after:inset-0"
            />
            <img
              src={item.image}
              alt={item.label}
              width={140}
              height={70}
              className="relative cursor-pointer overflow-hidden rounded-lg border shadow-sm shadow-black/5 ring-offset-background transition-colors peer-[:focus-visible]:ring-2 peer-[:focus-visible]:ring-ring/70 peer-[:focus-visible]:ring-offset-2 peer-data-[disabled]:cursor-not-allowed peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent peer-data-[disabled]:opacity-50"
            />
            <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
              <span className={'peer-data-[state=unchecked]:group-[]:hidden'}>
                <IconCheck size={16} aria-hidden="true" />
              </span>
              <span className={'peer-data-[state=checked]:group-[]:hidden'}>
                <IconMinus size={16} aria-hidden="true" />
              </span>

              <span className="text-xs font-medium">{item.label}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
