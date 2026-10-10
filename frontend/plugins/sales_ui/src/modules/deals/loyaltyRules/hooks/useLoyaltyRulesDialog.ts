import { toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loyaltyRulesDialogOpenAtom } from '../states';
import { useLoyaltyRulesForm } from './useLoyaltyRulesForm';
import { useLoyaltyTierRulesForm } from './useLoyaltyTierRulesForm';
import { useLoyaltyTierWallets } from './useLoyaltyTierWallets';

export type TLoyaltyRulesTab = 'points' | 'tier';

/** Points and tier rules, each saved only when changed, closed together. */
export const useLoyaltyRulesDialog = () => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useAtom(loyaltyRulesDialogOpenAtom);
  const [tab, setTab] = useState<TLoyaltyRulesTab>('points');
  const { enabled: tierEnabled } = useLoyaltyTierWallets();
  const points = useLoyaltyRulesForm(open);
  const tier = useLoyaltyTierRulesForm(open, tierEnabled);

  const submit = async () => {
    const pointsDirty = points.form.formState.isDirty;
    const tierDirty = tierEnabled && tier.form.formState.isDirty;
    const pointsValid = !pointsDirty || (await points.form.trigger());
    const tierValid = !tierDirty || (await tier.form.trigger());

    if (!pointsValid || !tierValid) {
      setTab(pointsValid ? 'tier' : 'points');
      toast({ title: t('loyalty-rules-invalid'), variant: 'destructive' });
      return;
    }

    try {
      if (pointsDirty) {
        await points.save(points.form.getValues());
      }

      if (tierDirty) {
        await tier.save(tier.form.getValues());
      }

      if (pointsDirty || tierDirty) {
        toast({ title: t('loyalty-rules-saved'), variant: 'success' });
      }

      setOpen(false);
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    }
  };

  return {
    open,
    setOpen,
    tab,
    setTab,
    tierEnabled,
    points,
    tier,
    loading: points.loading || tier.loading,
    saving: points.saving || tier.saving,
    submit,
  };
};
