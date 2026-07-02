import { Label, RadioGroup } from 'erxes-ui';
import { cn } from 'erxes-ui/lib';
import { cva } from 'class-variance-authority';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

type HeroStyleVariant = 'glossy' | 'aurora' | 'mesh' | 'flat';
type NavigationVariant = 'pill' | 'fluid';

// ── Hero style thumbnails ────────────────────────────────────────────────────

const heroBackgroundVariants = cva('h-full w-full', {
  variants: {
    variant: {
      glossy:
        'bg-[radial-gradient(120%_80%_at_88%_-10%,color-mix(in_oklch,var(--color-primary-foreground)_18%,transparent)_0%,transparent_55%),radial-gradient(80%_60%_at_10%_110%,color-mix(in_oklch,var(--color-primary)_22%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-black)_0%,color-mix(in_oklch,var(--color-black)_75%,black)_70%,color-mix(in_oklch,var(--color-black)_60%,black)_100%)]',
      aurora:
        'bg-[radial-gradient(60%_50%_at_80%_20%,color-mix(in_oklch,var(--color-primary)_55%,transparent)_0%,transparent_60%),radial-gradient(60%_60%_at_15%_110%,color-mix(in_oklch,var(--color-destructive)_45%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-black)_0%,color-mix(in_oklch,var(--color-black)_70%,black)_100%)]',
      mesh: 'bg-[radial-gradient(50%_40%_at_30%_30%,color-mix(in_oklch,var(--color-primary)_35%,transparent)_0%,transparent_60%),radial-gradient(40%_30%_at_80%_60%,color-mix(in_oklch,var(--color-info)_25%,transparent)_0%,transparent_60%),radial-gradient(40%_40%_at_70%_10%,color-mix(in_oklch,var(--color-warning)_18%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-black)_0%,color-mix(in_oklch,var(--color-black)_70%,black)_100%)]',
      flat: 'bg-[linear-gradient(180deg,var(--color-black)_0%,color-mix(in_oklch,var(--color-black)_70%,black)_100%)]',
    },
  },
  defaultVariants: {
    variant: 'glossy',
  },
});

const HERO_STYLE_OPTIONS: { value: HeroStyleVariant; label: string }[] = [
  { value: 'glossy', label: 'glossy' },
  { value: 'aurora', label: 'aurora' },
  { value: 'mesh', label: 'mesh' },
  { value: 'flat', label: 'flat' },
];

interface HeroStyleRadioGroupProps {
  value?: HeroStyleVariant;
  onChange: (value: HeroStyleVariant) => void;
}

export const HeroStyleRadioGroup = ({
  value,
  onChange,
}: HeroStyleRadioGroupProps) => {
  const { t } = useTranslation('frontline');
  return (
  <RadioGroup
    value={value}
    onValueChange={onChange}
    className="grid grid-cols-4 gap-2"
  >
    {HERO_STYLE_OPTIONS.map(({ value: opt, label }) => {
      const selected = value === opt;
      return (
        <Label
          key={opt}
          htmlFor={`hero-style-${opt}`}
          className={cn(
            'relative flex cursor-pointer flex-col items-center gap-1.5 overflow-hidden rounded-xl border-2',
            selected ? 'border-primary' : 'border-border',
          )}
        >
          <RadioGroup.Item
            value={opt}
            id={`hero-style-${opt}`}
            className="sr-only"
          />
          <div
            className={cn(heroBackgroundVariants({ variant: opt }), 'h-16')}
          />
          <span
            className={cn(
              'pb-1.5 text-xs',
              selected
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground',
            )}
          >
            {t(label)}
          </span>
          {selected && (
            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
              <IconCheck
                size={11}
                stroke={3}
                className="text-primary-foreground"
              />
            </span>
          )}
        </Label>
      );
    })}
  </RadioGroup>
  );
};

// ── Navigation variant previews ──────────────────────────────────────────────

const PillPreview = () => (
  <div className="flex h-14 w-full items-center justify-center rounded-lg bg-muted/50">
    <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-3 py-2 shadow-sm backdrop-blur-sm">
      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
    </div>
  </div>
);

const FluidPreview = () => (
  <div className="flex h-14 w-full items-center rounded-lg bg-muted/50 px-1">
    <div className="flex w-full items-center justify-between rounded bg-muted/80 px-3 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
    </div>
  </div>
);

const NAV_VARIANT_OPTIONS: {
  value: NavigationVariant;
  label: string;
  description: string;
  Preview: React.FC;
}[] = [
  {
    value: 'pill',
    label: 'pill',
    description: 'nav-floating-glass-group',
    Preview: PillPreview,
  },
  {
    value: 'fluid',
    label: 'fluid',
    description: 'nav-full-width-bar',
    Preview: FluidPreview,
  },
];

interface NavigationVariantRadioGroupProps {
  value?: NavigationVariant;
  onChange: (value: NavigationVariant) => void;
}

export const NavigationVariantRadioGroup = ({
  value,
  onChange,
}: NavigationVariantRadioGroupProps) => {
  const { t } = useTranslation('frontline');
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="grid grid-cols-2 gap-3"
    >
      {NAV_VARIANT_OPTIONS.map(({ value: opt, label, description, Preview }) => {
        const selected = value === opt;
        return (
          <Label
            key={opt}
            htmlFor={`nav-variant-${opt}`}
            className={cn(
              'relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-3',
              selected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-background',
            )}
          >
            <RadioGroup.Item
              value={opt}
              id={`nav-variant-${opt}`}
              className="sr-only"
            />
            <Preview />
            <div>
              <p
                className={cn(
                  'text-sm font-semibold',
                  selected ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {t(label)}
              </p>
              <p className="text-xs text-muted-foreground">{t(description)}</p>
            </div>
            {selected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <IconCheck
                  size={11}
                  stroke={3}
                  className="text-primary-foreground"
                />
              </span>
            )}
          </Label>
        );
      })}
    </RadioGroup>
  );
};
