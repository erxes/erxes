import { useTranslation } from 'react-i18next';
import { FieldValues, useForm } from 'react-hook-form';
import { Spinner } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import type { AccountingsConfigsCreateMutation } from '~/gql/graphql';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { getSyncConfigCode } from '@/settings/constants/settingsPanel';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useAccountingConfigAdd } from '@/settings/hooks/useAccountingConfigAdd';
import { useAccountingConfigEdit } from '@/settings/hooks/useAccountingConfigEdit';
import { useAccountingConfigs } from '@/settings/hooks/useAccountingConfigs';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { IConfig } from '@/settings/types/Config';
import { SettingsRuleByCode } from '@/settings/syncSettings/AddEditConfigRules';

const useSyncConfig = (contentType: string, contentId: string) => {
  const code = getSyncConfigCode(contentType);
  const { configs, loading } = useAccountingConfigs({
    variables: { code: code ?? '' },
  });

  return {
    code,
    config: configs?.find((item) => item?._id === contentId) as
      | IConfig
      | undefined,
    loading,
  };
};

const SyncConfigPanelNew = ({ contentType }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const code = getSyncConfigCode(contentType);
  const { openDetail, cancelDraft } = useSettingsPanel(contentType);
  const form = useForm<FieldValues>({ defaultValues: {} });
  const { addConfig, loading } = useAccountingConfigAdd({
    onCompleted: ({
      accountingsConfigsCreate,
    }: AccountingsConfigsCreateMutation) => {
      if (accountingsConfigsCreate?._id) {
        openDetail(accountingsConfigsCreate._id, { replace: true });
      }
    },
  });

  if (!code) {
    return <div>{t('unknown-configuration-type')}</div>;
  }

  const { subIdFieldName, FormComponent } = SettingsRuleByCode[code];

  const onSubmit = (data: FieldValues) => {
    if (loading) {
      return;
    }

    addConfig({
      code,
      subId: data[subIdFieldName] ?? '',
      value: data,
    });
  };

  return (
    <FormComponent
      form={form}
      onSubmit={onSubmit}
      onCancel={cancelDraft}
      loading={loading}
    />
  );
};

const SyncConfigEditForm = ({
  code,
  config,
}: {
  code: ACCOUNTING_SETTINGS_CODES;
  config: IConfig;
}) => {
  const { close } = useSidePanel();
  const form = useForm<FieldValues>({ defaultValues: { ...config.value } });
  const { editConfig, loading } = useAccountingConfigEdit();
  const { subIdFieldName, FormComponent } = SettingsRuleByCode[code];

  const onSubmit = (data: FieldValues) =>
    editConfig({
      id: config._id,
      subId: data[subIdFieldName],
      value: { ...config.value, ...data },
    });

  return (
    <FormComponent
      form={form}
      onSubmit={onSubmit}
      onCancel={close}
      loading={loading}
    />
  );
};

const SyncConfigPanelDetail = ({
  contentType,
  contentId,
}: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { code, config, loading } = useSyncConfig(contentType, contentId);

  if (!code) {
    return <div>{t('unknown-configuration-type')}</div>;
  }

  if (!config) {
    return loading ? <Spinner containerClassName="py-12" /> : null;
  }

  return <SyncConfigEditForm key={config._id} code={code} config={config} />;
};

export const SYNC_CONFIG_PANEL: ISettingsPanelViews = {
  addLabel: 'add-configuration',
  editLabel: 'edit-sync-settings',
  New: SyncConfigPanelNew,
  Detail: SyncConfigPanelDetail,
};
