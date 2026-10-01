import { Input, Spinner } from 'erxes-ui';
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
        <span key={tierKey || 'none'}>
          {tierName || t('earn-preview-no-tier')}:{' '}
          <b>{breakdown?.length ? Number(total).toLocaleString() : '—'}</b>
        </span>
      ))}
      {loading && <Spinner size="sm" />}
      <span className="w-full text-xs text-muted-foreground">
        {t('earn-preview-hint')}
      </span>
    </div>
  );
};
