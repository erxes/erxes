import { Button, Input, Spinner } from 'erxes-ui';
import { EarnCalcPopover } from '@/loyalties/scores/components/EarnCalcPopover';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../../constants/formSchema';
import { useEarnPreview } from '../../hooks/useEarnPreview';

export const EarnPreview = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const { amount, setAmount, loading, results } = useEarnPreview(form);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
      <span className="text-muted-foreground">{t('earn-preview')}</span>
      <Input
        type="number"
        className="h-8 w-32 bg-background"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />
      <span className="text-muted-foreground">₮ →</span>
      {results.map(({ tierKey, tierName, total, breakdown }) => (
        <span key={tierKey || 'none'} className="flex items-center gap-1">
          {tierName || t('earn-preview-no-tier')}:
          {breakdown?.length ? (
            <EarnCalcPopover breakdown={breakdown} total={Number(total)}>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 font-bold underline decoration-dotted underline-offset-4"
              >
                {Number(total).toLocaleString()}
              </Button>
            </EarnCalcPopover>
          ) : (
            <b>—</b>
          )}
        </span>
      ))}
      {loading && <Spinner size="sm" />}
      <span className="w-full text-xs text-muted-foreground">
        {t('earn-preview-hint')}
      </span>
    </div>
  );
};
