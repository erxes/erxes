import { IconCircleCheck } from '@tabler/icons-react';
import { Button, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Appear, EASE_OUT_QUAD, EASE_SPRING } from './Appear';

export const FinalSection = ({ onContinue }: { onContinue: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  useScopedHotkeys(`enter`, () => onContinue(), 'welcome');
  useScopedHotkeys(`space`, () => onContinue(), 'welcome');

  return (
    <Appear
      y={50}
      duration={600}
      easing={EASE_OUT_QUAD}
      className="flex flex-col gap-10 sm:-translate-y-10 md:-translate-y-10 px-4"
    >
      <Appear
        scale={0.5}
        duration={800}
        delay={200}
        easing={EASE_SPRING}
        className="flex items-center justify-center"
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
          <IconCircleCheck className="text-primary size-12" stroke={2} />
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
          {t('start-exploring')}
        </Button>
      </Appear>
    </Appear>
  );
};
