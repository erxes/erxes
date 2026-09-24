import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const WhatsappStepNav = ({
  onPrevious,
  previousDisabled = false,
  onNext,
  nextDisabled = false,
  nextLabel,
  nextType = 'button',
}: {
  onPrevious: () => void;
  previousDisabled?: boolean;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextType?: 'button' | 'submit';
}) => {
  const { t } = useTranslation('frontline');

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="bg-border"
        disabled={previousDisabled}
        onClick={onPrevious}
      >
        {t('previous-step')}
      </Button>
      <Button
        type={nextType}
        disabled={nextDisabled}
        onClick={nextType === 'submit' ? undefined : onNext}
      >
        {nextLabel ?? t('next-step')}
      </Button>
    </>
  );
};
