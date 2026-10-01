'use client';

import { Popover } from 'erxes-ui/components/popover';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { LOCALE_LABELS, LOCALES, storeLocale, type Locale } from '../locales';
import { useLocale, useT } from './LocaleProvider';

const TONES = {
  dark: 'text-white/55 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white',
  light:
    'text-muted-foreground hover:bg-subtle hover:text-ink focus-visible:bg-subtle data-[state=open]:bg-subtle data-[state=open]:text-ink',
} as const;

export const LanguageSwitcher = ({
  tone = 'dark',
  side = 'top',
  className,
}: {
  tone?: keyof typeof TONES;
  side?: 'top' | 'bottom';
  className?: string;
}) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    setOpen(false);

    if (next === locale) {
      return;
    }

    storeLocale(next);
    startTransition(() => router.refresh());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={t('language.choose')}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] outline-none transition-[background-color,color,transform] duration-200 ease-out-soft active:scale-[0.97]',
          TONES[tone],
          className,
        )}
      >
        <Icon
          name={pending ? 'clock' : 'language'}
          size={15}
          className={pending ? 'animate-spin' : undefined}
        />
        {LOCALE_LABELS[locale]}
        <Icon
          name="chevronDown"
          size={13}
          className={cn(
            'transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </Popover.Trigger>

      <Popover.Content
        side={side}
        align="end"
        sideOffset={8}
        className="w-44 rounded-xl border border-line p-1.5 shadow-shell-hover"
      >
        <ul role="listbox" aria-label={t('language.choose')}>
          {LOCALES.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={item === locale}
                onClick={() => choose(item)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium outline-none transition-[background-color,color,transform] duration-200 ease-out-soft hover:bg-subtle focus-visible:bg-subtle active:scale-[0.98]',
                  item === locale ? 'text-brand' : 'text-ink-soft',
                )}
              >
                {LOCALE_LABELS[item]}
                {item === locale ? <Icon name="check" size={15} /> : null}
              </button>
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover>
  );
};
