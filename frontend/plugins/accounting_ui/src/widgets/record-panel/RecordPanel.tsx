import { useTranslation } from 'react-i18next';
import { IRecordPanelProps, NEW_RECORD_ID } from 'ui-modules';
import { ACCOUNT_PANEL } from '@/settings/account/components/AccountPanel';
import { ACCOUNT_CATEGORY_PANEL } from '@/settings/account/account-categories/components/AccountCategoryPanel';
import { CTAX_ROW_PANEL } from '@/settings/ctax/components/CtaxRowPanel';
import { FXA_OWNER_RECORD_PANELS } from '@/fixedAssets/ownerRecords/components/FxaOwnerRecordPanel';
import { FIXED_ASSET_PANEL } from '@/settings/fixed-assets/components/FixedAssetPanel';
import { VAT_ROW_PANEL } from '@/settings/vat/components/VatRowPanel';
import { SYNC_CONFIG_PANEL } from '@/settings/syncSettings/SyncConfigPanel';
import { FIXED_ASSET_CATEGORY_PANEL } from '@/settings/fixed-assets/components/FixedAssetCategoryPanel';
import { FIXED_ASSET_ACCOUNT_CONFIG_PANEL } from '@/settings/fixed-assets/account-config/components/FixedAssetAccountConfigPanel';
import { ADJUST_FUND_RATE_PANEL } from '@/adjustments/rate/components/AdjustFundRatePanel';
import { ADJUST_DEBT_RATE_PANEL } from '@/adjustments/debt/components/AdjustDebtRatePanel';
import { ADJUST_CLOSING_PANEL } from '@/adjustments/closing/components/AdjustClosingPanel';
import { ADJUST_INVENTORY_PANEL } from '@/adjustments/inventories/components/AdjustInventoryForm';
import { ADJUST_FIXED_ASSET_PANEL } from '@/adjustments/fxa/components/AdjustFixedAssetForm';
import { SAFE_REMAINDER_PANEL } from '@/inventories/safeRemainders/components/SafeRemainderForm';
import {
  ISettingsPanelViews,
  SettingsPanelActivity,
} from '@/settings/components/panel/SettingsPanelLayout';
import {
  ACCOUNT_CATEGORY_CONTENT_TYPE,
  ACCOUNT_CONTENT_TYPE,
  CTAX_ROW_CONTENT_TYPE,
  FIXED_ASSET_CONTENT_TYPE,
  FIXED_ASSET_ACCOUNT_CONFIG_CONTENT_TYPE,
  FIXED_ASSET_CATEGORY_CONTENT_TYPE,
  getSyncConfigCode,
  VAT_ROW_CONTENT_TYPE,
} from '@/settings/constants/settingsPanel';
import {
  ADJUST_CLOSING_CONTENT_TYPE,
  ADJUST_DEBT_RATE_CONTENT_TYPE,
  ADJUST_FIXED_ASSET_CONTENT_TYPE,
  ADJUST_FUND_RATE_CONTENT_TYPE,
  ADJUST_INVENTORY_CONTENT_TYPE,
} from '@/adjustments/constants/adjustmentPanel';
import { SAFE_REMAINDER_CONTENT_TYPE } from '@/inventories/safeRemainders/constants/safeRemainderPanel';

const RECORD_PANELS: Record<string, ISettingsPanelViews> = {
  [ACCOUNT_CONTENT_TYPE]: ACCOUNT_PANEL,
  [ACCOUNT_CATEGORY_CONTENT_TYPE]: ACCOUNT_CATEGORY_PANEL,
  [VAT_ROW_CONTENT_TYPE]: VAT_ROW_PANEL,
  [CTAX_ROW_CONTENT_TYPE]: CTAX_ROW_PANEL,
  [FIXED_ASSET_CONTENT_TYPE]: FIXED_ASSET_PANEL,
  ...FXA_OWNER_RECORD_PANELS,
  [FIXED_ASSET_CATEGORY_CONTENT_TYPE]: FIXED_ASSET_CATEGORY_PANEL,
  [FIXED_ASSET_ACCOUNT_CONFIG_CONTENT_TYPE]: FIXED_ASSET_ACCOUNT_CONFIG_PANEL,
  [ADJUST_FUND_RATE_CONTENT_TYPE]: ADJUST_FUND_RATE_PANEL,
  [ADJUST_DEBT_RATE_CONTENT_TYPE]: ADJUST_DEBT_RATE_PANEL,
  [ADJUST_CLOSING_CONTENT_TYPE]: ADJUST_CLOSING_PANEL,
  [ADJUST_INVENTORY_CONTENT_TYPE]: ADJUST_INVENTORY_PANEL,
  [ADJUST_FIXED_ASSET_CONTENT_TYPE]: ADJUST_FIXED_ASSET_PANEL,
  [SAFE_REMAINDER_CONTENT_TYPE]: SAFE_REMAINDER_PANEL,
};

const SettingsPanelHeaderTitle = ({ label }: { label: string }) => {
  const { t } = useTranslation('accounting');

  return t(label);
};

const getRecordPanel = (contentType: string) =>
  RECORD_PANELS[contentType] ||
  (getSyncConfigCode(contentType) ? SYNC_CONFIG_PANEL : undefined);

export const RecordPanel = ({
  contentType,
  contentId,
  view,
}: IRecordPanelProps) => {
  const panel = getRecordPanel(contentType);

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
