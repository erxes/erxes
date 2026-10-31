import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from 'erxes-ui';
import { AdjustClosingForm } from '@/adjustments/closing/components/AddAdjustClosing';
import { useAdjustClosingAdd } from '@/adjustments/closing/hooks/useAdjustClosingAdd';
import { useAdjustClosingDetail } from '@/adjustments/closing/hooks/useAdjustClosingDetail';
import { useAdjustClosingEdit } from '@/adjustments/closing/hooks/useAdjustClosingEdit';
import { IAdjustClosing } from '@/adjustments/closing/types/AdjustClosing';
import { TAdjustClosingForm } from '@/adjustments/closing/types/adjustClosingForm';
import { adjustClosingSchema } from '@/adjustments/closing/types/adjustClosingSchema';
import { ADJUST_CLOSING_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const AdjustClosingPanelNew = () => {
  const { cancelDraft } = useSettingsPanel(ADJUST_CLOSING_CONTENT_TYPE);
  const { addAdjustClosing, loading } = useAdjustClosingAdd();
  const form = useForm<TAdjustClosingForm>({
    resolver: zodResolver(adjustClosingSchema),
    defaultValues: { date: new Date() },
  });

  const handleSubmit = (data: TAdjustClosingForm) => {
    addAdjustClosing({
      variables: { ...data },
      onCompleted: () => {
        form.reset();
      },
    });
  };

  return (
    <AdjustClosingForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
      isNew
    />
  );
};

const AdjustClosingEditForm = ({
  adjustClosing,
}: {
  adjustClosing: IAdjustClosing;
}) => {
  const { closePanel } = useSettingsPanel(ADJUST_CLOSING_CONTENT_TYPE);
  const { adjustClosingEdit, loading } = useAdjustClosingEdit();
  const entry = adjustClosing.details?.[0]?.entries?.[0];
  const form = useForm<TAdjustClosingForm>({
    resolver: zodResolver(adjustClosingSchema),
    defaultValues: {
      status: adjustClosing.status ?? undefined,
      date: adjustClosing.date ? new Date(adjustClosing.date) : new Date(),
      description: adjustClosing.description ?? '',
      beginDate: adjustClosing.beginDate
        ? new Date(adjustClosing.beginDate)
        : undefined,
      integrateAccountId: adjustClosing.integrateAccountId ?? undefined,
      periodGLAccountId: adjustClosing.periodGLAccountId ?? undefined,
      earningAccountId: adjustClosing.earningAccountId ?? undefined,
      accountId: entry?.accountId ?? undefined,
      balance: entry?.balance ?? undefined,
      percent: entry?.percent ?? undefined,
      mainAccTrId: entry?.mainAccTrId ?? undefined,
      integrateTrId: entry?.integrateTrId ?? undefined,
    },
  });

  const handleSubmit = (data: TAdjustClosingForm) => {
    adjustClosingEdit({
      variables: {
        ...data,
        _id: adjustClosing._id,
        taxPayableAccountId: data.taxPayableAccountId,
      },
      onCompleted: () => {
        closePanel();
      },
    });
  };

  return (
    <AdjustClosingForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={closePanel}
      saving={loading}
    />
  );
};

const AdjustClosingPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { adjustClosingDetail, loading } = useAdjustClosingDetail({
    variables: { _id: contentId },
  });

  if (!adjustClosingDetail) {
    return loading ? <Spinner containerClassName="py-12" /> : null;
  }

  return (
    <AdjustClosingEditForm
      key={adjustClosingDetail._id}
      adjustClosing={adjustClosingDetail}
    />
  );
};

export const ADJUST_CLOSING_PANEL: ISettingsPanelViews = {
  addLabel: 'Create Closing Adjustment',
  editLabel: 'Edit Closing Adjustment',
  New: AdjustClosingPanelNew,
  Detail: AdjustClosingPanelDetail,
};
