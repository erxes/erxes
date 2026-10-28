import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { CtaxRowForm } from '@/settings/ctax/components/CtaxRowForm';
import { ctaxFormSchema } from '@/settings/ctax/constants/ctaxFormSchema';
import { useAddCtaxRow } from '@/settings/ctax/hooks/useCtaxRowAdd';
import { useCtaxRowDetail } from '@/settings/ctax/hooks/useCtaxRowDetail';
import { useCtaxRowEdit } from '@/settings/ctax/hooks/useCtaxRowEdit';
import { useCtaxRowsRemove } from '@/settings/ctax/hooks/useCtaxRowsRemove';
import {
  CtaxKind,
  CTAX_KIND_LABELS,
  CtaxStatus,
  CTAX_STATUS_LABELS,
  TCtaxRowForm,
} from '@/settings/ctax/types/CtaxRow';
import {
  TaxRowCommonPanelFields,
  TTaxRowPanelChange,
} from '@/settings/components/TaxRowCommonFields';
import { SettingsPanelRemoveAction } from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDetailLayout,
} from '@/settings/components/panel/SettingsPanelLayout';
import { CTAX_ROW_CONTENT_TYPE } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const SCOPE = 'side-panel-ctax-row';

const CtaxRowPanelNew = () => {
  const { openDetail, cancelDraft } = useSettingsPanel(CTAX_ROW_CONTENT_TYPE);
  const { addCtax, loading } = useAddCtaxRow();
  const form = useForm<TCtaxRowForm>({
    resolver: zodResolver(ctaxFormSchema),
    defaultValues: {
      status: CtaxStatus.ACTIVE,
      kind: CtaxKind.NORMAL,
    },
  });

  const handleSubmit = (data: TCtaxRowForm) => {
    if (loading) {
      return;
    }

    addCtax({
      variables: { ...data },
      onCompleted: ({ ctaxRowsAdd }) => {
        if (ctaxRowsAdd?._id) {
          openDetail(ctaxRowsAdd._id, { replace: true });
        }
      },
    });
  };

  return (
    <CtaxRowForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    />
  );
};

const CtaxRowPanelActions = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { removeCtaxRows, loading } = useCtaxRowsRemove();

  return (
    <SettingsPanelRemoveAction
      message={t('are-you-sure-delete-this-account')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeCtaxRows({
          variables: { ctaxRowIds: [contentId] },
          onCompleted: () => {
            toast({
              title: t('success'),
              description: t('city-tax-row-deleted-successfully'),
            });
            onCompleted();
          },
        })
      }
    />
  );
};

const CtaxRowPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { ctaxRowDetail: ctaxRow, loading } = useCtaxRowDetail(contentId);
  const { editCtaxRow } = useCtaxRowEdit();

  const save = (fields: TTaxRowPanelChange) =>
    editCtaxRow({ variables: { _id: contentId, ...fields } });

  return (
    <SettingsPanelDetailLayout loading={loading} hasRecord={!!ctaxRow}>
      {ctaxRow && (
        <TaxRowCommonPanelFields
          scope={SCOPE}
          row={ctaxRow}
          kinds={Object.values(CtaxKind)}
          kindLabels={CTAX_KIND_LABELS}
          statuses={Object.values(CtaxStatus)}
          statusLabels={CTAX_STATUS_LABELS}
          onSave={save}
        />
      )}
    </SettingsPanelDetailLayout>
  );
};

export const CTAX_ROW_PANEL: ISettingsPanelViews = {
  addLabel: 'add-city-tax',
  editLabel: 'edit-city-tax-row',
  New: CtaxRowPanelNew,
  Actions: CtaxRowPanelActions,
  Detail: CtaxRowPanelDetail,
};
