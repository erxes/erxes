import { useEffect } from 'react';
import { Link } from 'react-router';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Alert } from 'erxes-ui';
import { useAccountsInline } from '@/settings/account/hooks/useAccounts';
import { AccountStatus } from '@/settings/account/types/Account';
import { useFixedAssetAccountConfigs } from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';

export const FxaOutAccountWarning = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const { t } = useTranslation('accounting');
  const accountId = useWatch({
    control: form.control,
    name: `trDocs.${index}.details.0.accountId`,
  });
  const currentDepreciationAccountId = useWatch({
    control: form.control,
    name: `trDocs.${index}.followInfos.accumulatedDepreciationAccountId`,
  });
  const { configs, loading, error, refetch } = useFixedAssetAccountConfigs();
  const depreciationAccountId =
    configs.find((config) => config.accountId === accountId)?.value
      .depreciationAccountId || '';
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useAccountsInline({
    variables: {
      ids: [accountId, depreciationAccountId].filter((id): id is string =>
        Boolean(id),
      ),
      permissionMode: 'write',
    },
    skip: !accountId,
  });

  useEffect(() => {
    if (loading || error) return;
    if (currentDepreciationAccountId !== depreciationAccountId) {
      form.setValue(
        `trDocs.${index}.followInfos.accumulatedDepreciationAccountId`,
        depreciationAccountId,
        { shouldValidate: true },
      );
    }
  }, [
    currentDepreciationAccountId,
    depreciationAccountId,
    error,
    form,
    index,
    loading,
  ]);

  useEffect(() => {
    if (!accountId) return;
    const refresh = () => {
      void refetch().catch(() => undefined);
      void refetchAccounts().catch(() => undefined);
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [accountId, refetch, refetchAccounts]);

  const configuredAccount = accounts.find(
    (account) =>
      account._id === depreciationAccountId &&
      account.status === AccountStatus.ACTIVE,
  );
  if (!accountId || loading || accountsLoading) return null;
  if (!error && !accountsError && depreciationAccountId && configuredAccount)
    return null;
  return (
    <Alert variant="warning" className="mt-4">
      <IconAlertTriangle />
      <Alert.Title>{t('warning')}</Alert.Title>
      <Alert.Description>
        {error?.message ||
          accountsError?.message ||
          t('fxa-missing-depreciation-account', {
            defaultValue:
              'Сонгосон үндсэн хөрөнгийн дансанд хуримтлагдсан элэгдлийн дансны холбоос тохируулаагүй эсвэл ашиглах боломжгүй байна.',
          })}
        <Link
          className="underline underline-offset-2"
          to="/accounting/settings/fixed-assets/accounts-config"
          target="_blank"
          rel="noreferrer"
        >
          {t('fxa-configure-account-links', {
            defaultValue: 'Дансны холбоос тохируулах',
          })}
        </Link>
      </Alert.Description>
    </Alert>
  );
};
