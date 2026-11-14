import { IconCircleCheck } from '@tabler/icons-react';
import { Button, Switch, useScopedHotkeys } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ONBOARDING_NS } from '../i18n';
import { Appear, EASE_OUT_QUAD, EASE_SPRING } from './Appear';

interface ExampleDataChoice {
  value: boolean;
  onChange: (value: boolean) => void;
}

const ExampleDataToggle = ({ exampleData }: { exampleData: ExampleDataChoice }) => {
  const { t } = useTranslation(ONBOARDING_NS);
  const id = useId();

  return (
    <Appear y={20} duration={500} delay={500} className="-my-4 w-full">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border bg-background p-3.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium">{t('example-data', 'Add example data')}</span>
          <span className="block text-xs text-muted-foreground">
            {t(
              'example-data-description',
              'A few companies, customers and leads with notes, to explore with. Tagged “Example”, so you can delete them any time.',
            )}
          </span>
        </span>
        <Switch
          id={id}
          checked={exampleData.value}
          onCheckedChange={exampleData.onChange}
          className="mt-0.5 shrink-0"
        />
      </label>
    </Appear>
  );
};

export const FinalSection = ({
  onContinue,
  exampleData,
}: {
  onContinue: () => void;
  /** Offered to the owner of a fresh organisation: fill it with example data. */
  exampleData?: ExampleDataChoice;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });

  useScopedHotkeys(`enter`, () => onContinue(), 'welcome');
  useScopedHotkeys(`space`, () => onContinue(), 'welcome');

  return (
    <Appear
      y={50}
      duration={600}
      easing={EASE_OUT_QUAD}
      className="flex w-full max-w-md flex-col gap-10 px-4 sm:-translate-y-10 md:-translate-y-10"
    >
      <Appear
        scale={0.5}
        duration={800}
        delay={200}
        easing={EASE_SPRING}
        className="flex items-center justify-center"
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
          <IconCircleCheck className="text-primary-text size-12" stroke={2} />
        </div>
      </Appear>

      <Appear y={20} duration={500} delay={400} className="flex flex-col gap-2 items-center">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">
          {t('all-set')}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground text-center px-4 max-w-md">
          {t('all-set-description')}
        </p>
      </Appear>

      {exampleData && <ExampleDataToggle exampleData={exampleData} />}

      <Appear
        y={20}
        scale={0.95}
        duration={600}
        delay={600}
        className="w-full px-6 sm:px-12 lg:px-20"
      >
        <Button
          className="w-full hover:scale-102 active:scale-98"
          size="lg"
          variant="secondary"
          onClick={onContinue}
        >
          {t('start-exploring')}
        </Button>
      </Appear>
    </Appear>
  );
};