import { useTranslation } from 'react-i18next';
import { IRecordPanelProps, NEW_RECORD_ID } from 'ui-modules';
import { ACCOUNT_PANEL } from '@/settings/account/components/AccountPanel';
import { ACCOUNT_CATEGORY_PANEL } from '@/settings/account/account-categories/components/AccountCategoryPanel';
import { CTAX_ROW_PANEL } from '@/settings/ctax/components/CtaxRowPanel';
import { VAT_ROW_PANEL } from '@/settings/vat/components/VatRowPanel';
import { SYNC_CONFIG_PANEL } from '@/settings/syncSettings/SyncConfigPanel';
import {
  ISettingsPanelViews,
  SettingsPanelActivity,
} from '@/settings/components/panel/SettingsPanelLayout';
import {
  ACCOUNT_CATEGORY_CONTENT_TYPE,
  ACCOUNT_CONTENT_TYPE,
  CTAX_ROW_CONTENT_TYPE,
  getSyncConfigCode,
  VAT_ROW_CONTENT_TYPE,
} from '@/settings/constants/settingsPanel';

const SETTINGS_PANELS: Record<string, ISettingsPanelViews> = {
  [ACCOUNT_CONTENT_TYPE]: ACCOUNT_PANEL,
  [ACCOUNT_CATEGORY_CONTENT_TYPE]: ACCOUNT_CATEGORY_PANEL,
  [VAT_ROW_CONTENT_TYPE]: VAT_ROW_PANEL,
  [CTAX_ROW_CONTENT_TYPE]: CTAX_ROW_PANEL,
};

const SettingsPanelHeaderTitle = ({ label }: { label: string }) => {
  const { t } = useTranslation('accounting');

  return t(label);
};

const getSettingsPanel = (contentType: string) =>
  SETTINGS_PANELS[contentType] ||
  (getSyncConfigCode(contentType) ? SYNC_CONFIG_PANEL : undefined);

export const RecordPanel = ({
  contentType,
  contentId,
  view,
}: IRecordPanelProps) => {
  const panel = getSettingsPanel(contentType);

  if (!panel) {
    return null;
  }

  const { New, Actions, Detail } = panel;

  if (view === 'new') {
    return <New contentType={contentType} contentId={contentId} />;
  }

  if (view === 'title') {
    return (
      <SettingsPanelHeaderTitle
        label={contentId === NEW_RECORD_ID ? panel.addLabel : panel.editLabel}
      />
    );
  }

  if (view === 'actions') {
    return Actions ? (
      <Actions contentType={contentType} contentId={contentId} />
    ) : null;
  }

  if (view === 'activity') {
    return <SettingsPanelActivity contentId={contentId} />;
  }

  if (view === 'properties') {
    return null;
  }

  return <Detail contentType={contentType} contentId={contentId} />;
};

export default RecordPanel;
