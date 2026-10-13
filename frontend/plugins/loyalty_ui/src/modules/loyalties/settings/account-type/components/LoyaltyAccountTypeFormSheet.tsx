import {
  IconCoins,
  IconHourglass,
  IconSettings,
  IconStairs,
} from '@tabler/icons-react';
import { Button, Form, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SectionedSheetForm } from '../../../components/SectionedSheetForm';
import { useLoyaltyAccountTypeForm } from '../hooks/useLoyaltyAccountTypeForm';
import {
  LOYALTY_ACCOUNT_TYPE_SECTIONS,
  useLoyaltyAccountTypeSections,
} from '../hooks/useLoyaltyAccountTypeSections';
import { ILoyaltyAccountType } from '../types';
import { LoyaltyAccountTypeExpirySection } from './LoyaltyAccountTypeExpirySection';
import { LoyaltyAccountTypeGeneralSection } from './LoyaltyAccountTypeGeneralSection';
import { LoyaltyAccountTypePointsSection } from './LoyaltyAccountTypePointsSection';
import { LoyaltyAccountTypeTiersField } from './LoyaltyAccountTypeTiersField';

const SECTION_META = {
  general: {
    labelKey: 'loyalty-account-type-section-general',
    icon: IconSettings,
  },
  points: { labelKey: 'loyalty-account-type-section-points', icon: IconCoins },
  tiers: { labelKey: 'loyalty-tiers', icon: IconStairs },
  expiry: {
    labelKey: 'loyalty-account-type-section-expiry',
    icon: IconHourglass,
  },
};

export const LoyaltyAccountTypeFormSheet = ({
  accountType,
  open,
  onOpenChange,
  onCreated,
}: {
  accountType?: ILoyaltyAccountType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (accountTypeId: string) => void;
}) => {
  const { t } = useTranslation('loyalty');
  const { form, onSubmit, isEdit, loading, cashbackPercent } =
    useLoyaltyAccountTypeForm({
      accountType,
      open,
      onDone: () => onOpenChange(false),
      onCreated,
    });
  const { active, setActive, withErrors } = useLoyaltyAccountTypeSections(form);
  const { control } = form;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="p-0 md:max-w-3xl md:w-[calc(100vw-(--spacing(4)))] flex flex-col gap-0 overflow-hidden">
        <Sheet.Header>
          <Sheet.Title>
            {isEdit
              ? t('edit-loyalty-account-type')
              : t('add-loyalty-account-type')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form
            // Opened from inside another form (a campaign, a settings tab),
            // its submit must not submit that form too: React events cross
            // the sheet's portal.
            onSubmit={(event) => {
              event.stopPropagation();
              onSubmit(event);
            }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <SectionedSheetForm
              sections={LOYALTY_ACCOUNT_TYPE_SECTIONS.map((key) => ({
                key,
                ...SECTION_META[key],
                hasError: withErrors.has(key),
              }))}
              active={active}
              onSelect={setActive}
            >
              {active === 'general' && (
                <LoyaltyAccountTypeGeneralSection
                  control={control}
                  isEdit={isEdit}
                />
              )}
              {active === 'points' && (
                <LoyaltyAccountTypePointsSection
                  control={control}
                  cashbackPercent={cashbackPercent}
                />
              )}
              {active === 'tiers' && (
                <LoyaltyAccountTypeTiersField control={control} />
              )}
              {active === 'expiry' && (
                <LoyaltyAccountTypeExpirySection
                  control={control}
                  accountTypeId={accountType?._id}
                />
              )}
            </SectionedSheetForm>
            <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
              <Button
                type="button"
                variant="ghost"
                className="bg-background hover:bg-background/90"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('saving') : t('save')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
