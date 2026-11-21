import { useQuery } from '@tanstack/react-query';
import { LookupPicker } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { type ActionInputProps, asList } from './actionFieldSelects';
import { accountChoicesQuery } from './recordChoices';

export const IntegrationAccountSelect = ({
  field,
  value,
  onChange,
  disabled,
  dataFields,
}: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const { integration = '', accountKind } = field;
  const accounts = useQuery(accountChoicesQuery({ integration, accountKind }));

  const fromRun = dataFields
    .filter(
      (item) =>
        item.integration === integration && (!accountKind || item.accountKind === accountKind),
    )
    .map((item) => ({
      value: `{{${item.path}}}`,
      label: item.groupLabel ? `${item.groupLabel}: ${item.label}` : item.label,
    }));

  if (accounts.isSuccess && !accounts.data.length && !fromRun.length) {
    return (
      <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
        {t('no-accounts', 'Nothing is connected yet.')}{' '}
        <Link
          to={paths.settings.integration(integration)}
          className="text-primary-text hover:underline"
        >
          {t('connect-in-integrations', 'Connect one in Integrations')}
        </Link>
      </p>
    );
  }

  return (
    <LookupPicker
      lookup={{
        options: [
          ...fromRun,
          ...(accounts.data ?? []).map((account) => ({
            value: account.value,
            label: account.broken
              ? t('account-broken', '{{name}} (needs reconnecting)', { name: account.label })
              : account.label,
          })),
        ],
        loading: accounts.isPending,
        error: accounts.error,
      }}
      value={asList(value)}
      onValueChange={(ids) => onChange(ids[0])}
      disabled={disabled}
      placeholder={t('choose', 'Choose…')}
    />
  );
};
