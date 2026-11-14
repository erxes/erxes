import { IconAdjustmentsCode } from '@tabler/icons-react';
import { AccountingHeader } from '@/layout/components/Header';
import { useNavigate, useParams } from 'react-router';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { createFavoriteBreadcrumb } from 'ui-modules';

export const adjustTypes = [
  { value: 'fundRate', label: 'fund-rate' },
  { value: 'debRate', label: 'debt-rate' },
  { value: 'inventory', label: 'inventory' },
  { value: 'fxa', label: 'fixed-asset' },
  { value: 'closing', label: 'closing-entry' },
];

export const AdjustmentHeader = ({
  children,
  defaultKind,
}: {
  children?: React.ReactNode;
  defaultKind?: string;
}) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const params = useParams();
  const subTitle = defaultKind || params['*']?.replace('adjustment/', '');
  const currentKind = adjustTypes.find((kind) => kind.value === subTitle);

  return (
    <AccountingHeader
      leftChildren={
        <Select
          value={subTitle}
          onValueChange={(val) => navigate(`/accounting/adjustment/${val}`)}
        >
          <Select.Trigger>
            <Select.Value placeholder={t('select-a-kind')} />
          </Select.Trigger>
          <Select.Content>
            {adjustTypes.map((kind) => (
              <Select.Item
                key={kind.value}
                value={kind.value}
                className="capitalize"
              >
                {t(kind.label, { nsSeparator: false })}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      }
      returnLink={`/accounting/adjustment/${currentKind?.value ?? 'inventory'}`}
      returnText={t('adjustment-settings')}
      favoriteBreadcrumb={createFavoriteBreadcrumb(
        t('accounting'),
        t('adjustment-settings'),
        currentKind && t(currentKind.label, { nsSeparator: false }),
      )}
      icon={IconAdjustmentsCode}
    >
      {children}
    </AccountingHeader>
  );
};
