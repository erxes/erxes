import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PanelField } from 'ui-modules';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { SettingsPanelRemoveAction } from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDetailLayout,
} from '@/settings/components/panel/SettingsPanelLayout';
import {
  FIXED_ASSET_ACCOUNT_CONFIG_CONTENT_TYPE,
  SETTINGS_PANEL_CELL_CLASS_NAME,
} from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { FixedAssetAccountConfigForm } from '@/settings/fixed-assets/account-config/components/FixedAssetAccountConfigForm';
import {
  FIXED_ASSET_ACCOUNT_CONFIG_DEFAULT_VALUES,
  FIXED_ASSET_RELATED_ACCOUNT_FIELDS,
  fixedAssetAccountConfigSchema,
} from '@/settings/fixed-assets/account-config/constants/schema';
import {
  useFixedAssetAccountConfigMutations,
  useFixedAssetAccountConfigs,
} from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';
import {
  IFixedAssetAccountConfig,
  TFixedAssetAccountConfigForm,
} from '@/settings/fixed-assets/account-config/types/FixedAssetAccountConfig';

const SCOPE = 'side-panel-fixed-asset-account-config';

const FixedAssetAccountConfigPanelNew = () => {
  const { openDetail, cancelDraft } = useSettingsPanel(
    FIXED_ASSET_ACCOUNT_CONFIG_CONTENT_TYPE,
  );
  const { add, adding } = useFixedAssetAccountConfigMutations();
  const form = useForm<TFixedAssetAccountConfigForm>({
    resolver: zodResolver(fixedAssetAccountConfigSchema),
    defaultValues: FIXED_ASSET_ACCOUNT_CONFIG_DEFAULT_VALUES,
  });

  const handleSubmit = (data: TFixedAssetAccountConfigForm) => {
    if (adding) {
      return;
    }

    add({
      variables: data,
      onCompleted: ({ accountingsConfigsCreate }) => {
        if (accountingsConfigsCreate?._id) {
          openDetail(accountingsConfigsCreate._id, { replace: true });
        }
      },
    });
  };

  return (
    <FixedAssetAccountConfigForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={adding}
    />
  );
};

const FixedAssetAccountConfigPanelActions = ({
  contentId,
}: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { remove, removing } = useFixedAssetAccountConfigMutations();

  return (
    <SettingsPanelRemoveAction
      message={t('delete-this-account-configuration')}
      loading={removing}
      onRemove={(onCompleted) =>
        remove({ variables: { _id: contentId }, onCompleted })
      }
    />
  );
};

const FixedAssetAccountConfigPanelDetail = ({
  contentId,
}: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { configs, loading } = useFixedAssetAccountConfigs();
  const { edit } = useFixedAssetAccountConfigMutations();
  const config = configs.find((item) => item._id === contentId);

  const save = (
    current: IFixedAssetAccountConfig,
    fields: Partial<IFixedAssetAccountConfig['value']>,
  ) => {
    const accountId = fields.accountId ?? current.accountId;

    edit({
      variables: {
        _id: current._id,
        accountId,
        value: { ...current.value, ...fields, accountId },
      },
    });
  };

  return (
    <SettingsPanelDetailLayout loading={loading} hasRecord={!!config}>
      {config && (
        <>
          <PanelField label={t('fixed-asset-cost-account')}>
            <SelectAccount
              mode="single"
              scope={`${SCOPE}.accountId`}
              value={config.accountId}
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
              defaultFilter={{
                journals: [JournalEnum.FIXED_ASSET],
                permissionMode: 'write',
              }}
              onValueChange={(accountId) =>
                typeof accountId === 'string' &&
                accountId &&
                accountId !== config.accountId &&
                save(config, { accountId })
              }
            />
          </PanelField>
          {FIXED_ASSET_RELATED_ACCOUNT_FIELDS.map(([name, label]) => (
            <PanelField key={name} label={t(label)}>
              <SelectAccount
                mode="single"
                scope={`${SCOPE}.${name}`}
                value={config.value[name] || ''}
                variant="ghost"
                hideChevron
                className={SETTINGS_PANEL_CELL_CLASS_NAME}
                defaultFilter={{ permissionMode: 'write' }}
                onValueChange={(accountId) =>
                  typeof accountId === 'string' &&
                  accountId !== (config.value[name] || '') &&
                  save(config, { [name]: accountId })
                }
              />
            </PanelField>
          ))}
        </>
      )}
    </SettingsPanelDetailLayout>
  );
};

export const FIXED_ASSET_ACCOUNT_CONFIG_PANEL: ISettingsPanelViews = {
  addLabel: 'add-account-configuration',
  editLabel: 'edit-account-configuration',
  New: FixedAssetAccountConfigPanelNew,
  Actions: FixedAssetAccountConfigPanelActions,
  Detail: FixedAssetAccountConfigPanelDetail,
};
