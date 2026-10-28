import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CurrencyField, toast } from 'erxes-ui';
import { PanelField, SelectBranches, SelectDepartments } from 'ui-modules';
import { AccountForm } from '@/settings/account/components/AccountForm';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';
import { ACCOUNT_DEFAULT_VALUES } from '@/settings/account/constants/accountDefaultValues';
import { accountSchema } from '@/settings/account/constants/accountSchema';
import { useAccountAdd } from '@/settings/account/hooks/useAccountAdd';
import { useAccountDetail } from '@/settings/account/hooks/useAccountDetail';
import { useAccountEdit } from '@/settings/account/hooks/useAccountEdit';
import { useAccountsRemove } from '@/settings/account/hooks/useAccountsRemove';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
import { TAccountForm } from '@/settings/account/types/accountForm';
import {
  getAccountJournalOptions,
  getAccountKindOptions,
  getAccountStatusOptions,
} from '@/settings/account/utils/accountOptions';
import { SettingsPanelRemoveAction } from '@/settings/components/panel/SettingsPanelActions';
import {
  SettingsPanelDescriptionField,
  SettingsPanelSelect,
  SettingsPanelSwitch,
  SettingsPanelTextField,
} from '@/settings/components/panel/SettingsPanelFields';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDetailLayout,
} from '@/settings/components/panel/SettingsPanelLayout';
import {
  ACCOUNT_CONTENT_TYPE,
  SETTINGS_PANEL_CELL_CLASS_NAME,
} from '@/settings/constants/settingsPanel';
import {
  getCurrencyCodeFromOptions,
  useCurrencyConfigs,
} from '@/settings/hooks/useCurrencyConfigs';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const SCOPE = 'side-panel-account';

const AccountPanelNew = () => {
  const { openDetail, cancelDraft } = useSettingsPanel(ACCOUNT_CONTENT_TYPE);
  const { addAccount, loading } = useAccountAdd();
  const form = useForm<TAccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: ACCOUNT_DEFAULT_VALUES,
  });

  const handleSubmit = (data: TAccountForm) => {
    if (loading) {
      return;
    }

    addAccount({
      variables: data,
      onCompleted: ({ accountsAdd }) => {
        if (accountsAdd?._id) {
          openDetail(accountsAdd._id, { replace: true });
        }
      },
    });
  };

  return (
    <AccountForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    />
  );
};

const AccountPanelActions = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { removeAccounts, loading } = useAccountsRemove();

  return (
    <SettingsPanelRemoveAction
      message={t('are-you-sure-delete-this-account')}
      loading={loading}
      permission="removeAccounts"
      onRemove={(onCompleted) =>
        removeAccounts({
          variables: { accountIds: [contentId] },
          onCompleted,
        })
      }
    />
  );
};

const AccountPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { accountDetail: account, loading } = useAccountDetail(contentId);
  const { dealCurrencyOptions } = useCurrencyConfigs();
  const { editAccount } = useAccountEdit();

  const save = (current: IAccount, fields: Partial<TAccountForm>) => {
    if (!fields.categoryId && !current.categoryId) {
      toast({ title: t('no-category-selected'), variant: 'destructive' });
      return;
    }

    editAccount(
      { variables: { ...current, ...fields, _id: current._id } },
      Object.keys(fields),
    );
  };

  return (
    <SettingsPanelDetailLayout loading={loading} hasRecord={!!account}>
      {account && (
        <>
          <PanelField label={t('name')}>
            <SettingsPanelTextField
              scope={`${SCOPE}.name`}
              value={account.name || ''}
              placeholder={t('enter-account-name')}
              onSave={(name) => save(account, { name })}
            />
          </PanelField>
          <PanelField label={t('code')}>
            <SettingsPanelTextField
              scope={`${SCOPE}.code`}
              value={account.code || ''}
              placeholder={t('enter-account-code')}
              onSave={(code) => save(account, { code })}
            />
          </PanelField>
          <PanelField label={t('category')}>
            <SelectAccountCategory
              recordId={`${SCOPE}.category`}
              selected={account.categoryId}
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
              onSelect={(categoryId) =>
                categoryId &&
                categoryId !== account.categoryId &&
                save(account, { categoryId })
              }
            />
          </PanelField>
          <PanelField label={t('currency')}>
            <CurrencyField.SelectCurrency
              value={getCurrencyCodeFromOptions(
                account.currency,
                dealCurrencyOptions,
              )}
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
              currencies={dealCurrencyOptions}
              onChange={(currency) =>
                currency !== account.currency && save(account, { currency })
              }
            />
          </PanelField>
          <PanelField label={t('type')}>
            <SettingsPanelSelect
              value={account.kind}
              placeholder={t('select-type')}
              options={getAccountKindOptions(t)}
              onValueChange={(kind) => save(account, { kind })}
            />
          </PanelField>
          <PanelField label={t('journal')}>
            <SettingsPanelSelect
              value={account.journal}
              placeholder={t('select-journal')}
              options={getAccountJournalOptions(t)}
              onValueChange={(journal) => save(account, { journal })}
            />
          </PanelField>
          {account.journal === JournalEnum.BANK && (
            <>
              <PanelField label={t('bank-label')}>
                <SettingsPanelTextField
                  scope={`${SCOPE}.bank`}
                  value={account.extra?.bank || ''}
                  placeholder={t('enter-bank-name')}
                  onSave={(bank) =>
                    save(account, {
                      extra: {
                        bank,
                        bankAccount: account.extra?.bankAccount,
                      },
                    })
                  }
                />
              </PanelField>
              <PanelField label={t('bank-account')}>
                <SettingsPanelTextField
                  scope={`${SCOPE}.bankAccount`}
                  value={account.extra?.bankAccount || ''}
                  placeholder={t('enter-bank-account-number')}
                  onSave={(bankAccount) =>
                    save(account, {
                      extra: { bank: account.extra?.bank, bankAccount },
                    })
                  }
                />
              </PanelField>
            </>
          )}
          <PanelField label={t('branch')}>
            <SelectBranches.InlineCell
              mode="single"
              scope={`${SCOPE}.branch`}
              value={account.branchId || ''}
              onValueChange={(branchId) =>
                typeof branchId === 'string' &&
                branchId !== account.branchId &&
                save(account, { branchId })
              }
            />
          </PanelField>
          <PanelField label={t('department')}>
            <SelectDepartments.InlineCell
              mode="single"
              scope={`${SCOPE}.department`}
              value={account.departmentId || ''}
              onValueChange={(departmentId) =>
                typeof departmentId === 'string' &&
                departmentId !== account.departmentId &&
                save(account, { departmentId })
              }
            />
          </PanelField>
          <PanelField label={t('temporary-account')} cell={false}>
            <SettingsPanelSwitch
              checked={!!account.isTemp}
              onCheckedChange={(isTemp) => save(account, { isTemp })}
            />
          </PanelField>
          <PanelField label={t('off-balance-sheet')} cell={false}>
            <SettingsPanelSwitch
              checked={!!account.isOutBalance}
              onCheckedChange={(isOutBalance) =>
                save(account, { isOutBalance })
              }
            />
          </PanelField>
          <PanelField label={t('status')}>
            <SettingsPanelSelect
              value={account.status}
              placeholder={t('select-status')}
              options={getAccountStatusOptions(t)}
              onValueChange={(status) => save(account, { status })}
            />
          </PanelField>
          <SettingsPanelDescriptionField
            key={account._id}
            value={account.description || ''}
            onSave={(description) => save(account, { description })}
          />
        </>
      )}
    </SettingsPanelDetailLayout>
  );
};

export const ACCOUNT_PANEL: ISettingsPanelViews = {
  addLabel: 'add-account',
  editLabel: 'edit-account',
  New: AccountPanelNew,
  Actions: AccountPanelActions,
  Detail: AccountPanelDetail,
};
