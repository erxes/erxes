import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { PanelField } from 'ui-modules';
import { VatRowForm } from '@/settings/vat/components/VatRowForm';
import { vatFormSchema } from '@/settings/vat/constants/vatFormSchema';
import { useAddVatRow } from '@/settings/vat/hooks/useVatRowAdd';
import { useVatRowDetail } from '@/settings/vat/hooks/useVatRowDetail';
import { useVatRowEdit } from '@/settings/vat/hooks/useVatRowEdit';
import { useVatRowsRemove } from '@/settings/vat/hooks/useVatRowsRemove';
import {
  TVatRowForm,
  VatKind,
  VAT_KIND_LABELS,
  VatStatus,
  VAT_STATUS_LABELS,
} from '@/settings/vat/types/VatRow';
import {
  TaxRowCommonPanelFields,
  TTaxRowPanelChange,
} from '@/settings/components/TaxRowCommonFields';
import { SettingsPanelRemoveAction } from '@/settings/components/panel/SettingsPanelActions';
import {
  SettingsPanelNumberField,
  SettingsPanelSwitch,
} from '@/settings/components/panel/SettingsPanelFields';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDetailLayout,
} from '@/settings/components/panel/SettingsPanelLayout';
import { VAT_ROW_CONTENT_TYPE } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const SCOPE = 'side-panel-vat-row';

const VatRowPanelNew = () => {
  const { openDetail, cancelDraft } = useSettingsPanel(VAT_ROW_CONTENT_TYPE);
  const { addVat, loading } = useAddVatRow();
  const form = useForm<TVatRowForm>({
    resolver: zodResolver(vatFormSchema),
    defaultValues: {
      status: VatStatus.ACTIVE,
      isBold: false,
      kind: VatKind.NORMAL,
    },
  });

  const handleSubmit = (data: TVatRowForm) => {
    if (loading) {
      return;
    }

    addVat({
      variables: { ...data },
      onCompleted: ({ vatRowsAdd }) => {
        if (vatRowsAdd?._id) {
          openDetail(vatRowsAdd._id, { replace: true });
        }
      },
    });
  };

  return (
    <VatRowForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    />
  );
};

const VatRowPanelActions = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { removeVatRows, loading } = useVatRowsRemove();

  return (
    <SettingsPanelRemoveAction
      message={t('are-you-sure-delete-this-vat-row')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeVatRows({
          variables: { vatRowIds: [contentId] },
          onCompleted: () => {
            toast({
              title: t('success'),
              description: t('vat-rows-deleted-successfully'),
            });
            onCompleted();
          },
        })
      }
    />
  );
};

const VatRowPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { vatRowDetail: vatRow, loading } = useVatRowDetail(contentId);
  const { editVatRow } = useVatRowEdit();

  const save = (
    fields: TTaxRowPanelChange & { tabCount?: number; isBold?: boolean },
  ) => editVatRow({ variables: { _id: contentId, ...fields } });

  return (
    <SettingsPanelDetailLayout loading={loading} hasRecord={!!vatRow}>
      {vatRow && (
        <>
          <TaxRowCommonPanelFields
            scope={SCOPE}
            row={vatRow}
            kinds={Object.values(VatKind)}
            kindLabels={VAT_KIND_LABELS}
            statuses={Object.values(VatStatus)}
            statusLabels={VAT_STATUS_LABELS}
            onSave={save}
          />
          <PanelField label={t('indentation-level')}>
            <SettingsPanelNumberField
              scope={`${SCOPE}.tabCount`}
              value={vatRow.tabCount}
              min={0}
              placeholder={t('indentation-level')}
              onSave={(tabCount) => save({ tabCount })}
            />
          </PanelField>
          <PanelField label={t('bold-text')} cell={false}>
            <SettingsPanelSwitch
              checked={!!vatRow.isBold}
              onCheckedChange={(isBold) => save({ isBold })}
            />
          </PanelField>
        </>
      )}
    </SettingsPanelDetailLayout>
  );
};

export const VAT_ROW_PANEL: ISettingsPanelViews = {
  addLabel: 'add-vat',
  editLabel: 'edit-vat-details',
  New: VatRowPanelNew,
  Actions: VatRowPanelActions,
  Detail: VatRowPanelDetail,
};
