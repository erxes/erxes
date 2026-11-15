import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Spinner, isDeeplyEqual } from 'erxes-ui';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
  SelectBranches,
  SelectCategory,
  SelectDepartments,
  SelectProduct,
} from 'ui-modules';
import { AdjustBranchDepartmentFields } from '@/adjustments/components/AdjustPanelFields';
import { RESERVE_REM_CONTENT_TYPE } from '@/inventories/reserveRemainders/constants/reserveRemPanel';
import { useReserveRemAdd } from '@/inventories/reserveRemainders/hooks/useReserveRemAdd';
import { useReserveRemDetail } from '@/inventories/reserveRemainders/hooks/useReserveRemDetail';
import { useReserveRemEdit } from '@/inventories/reserveRemainders/hooks/useReserveRemEdit';
import { useReserveRemsRemove } from '@/inventories/reserveRemainders/hooks/useReserveRemsRemove';
import {
  getReserveRemEditSchema,
  getReserveRemSchema,
  TReserveRemEditForm,
  TReserveRemForm,
} from '@/inventories/reserveRemainders/types/reserveRemForm';
import {
  SettingsPanelAddButton,
  SettingsPanelRemoveAction,
} from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDraftForm,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const SCOPE = 'side-panel-reserve-rem';
const UNASSIGNED_LOCATION = '_';

const toFormLocation = (id?: string | null) =>
  id && id !== UNASSIGNED_LOCATION ? id : '';

export const AddReserveRem = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={RESERVE_REM_CONTENT_TYPE}
      label={t('add-reserve-remainder')}
    />
  );
};

const ReserveRemRemainderField = <
  TForm extends FieldValues & { remainder: number },
>({
  control,
}: {
  control: Control<TForm>;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <Form.Field
      control={control}
      name={'remainder' as Path<TForm>}
      render={({ field, fieldState }) => (
        <PanelFormRow
          label={t('reserve-remainder')}
          required
          error={fieldState.error?.message}
        >
          <Input
            type="number"
            value={field.value ?? ''}
            onChange={(e) =>
              field.onChange(
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
            className={PANEL_INPUT_CLASS_NAME}
          />
        </PanelFormRow>
      )}
    />
  );
};

const ReserveRemPanelNew = () => {
  const { t } = useTranslation('accounting');
  const { cancelDraft, closePanel } = useSettingsPanel(
    RESERVE_REM_CONTENT_TYPE,
  );
  const { addReserveRem, loading } = useReserveRemAdd();
  const form = useForm<TReserveRemForm>({
    resolver: zodResolver(getReserveRemSchema(t)),
    defaultValues: { branchIds: [], departmentIds: [], remainder: 0 },
  });

  const handleSubmit = (data: TReserveRemForm) => {
    if (loading) {
      return;
    }

    addReserveRem({ variables: data, onCompleted: closePanel });
  };

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    >
      <Form.Field
        control={form.control}
        name="branchIds"
        render={({ field }) => (
          <PanelFormRow label={t('branch')}>
            <SelectBranches.InlineCell
              mode="multiple"
              scope={`${SCOPE}.branches`}
              value={field.value ?? []}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="departmentIds"
        render={({ field }) => (
          <PanelFormRow label={t('department')}>
            <SelectDepartments.InlineCell
              mode="multiple"
              scope={`${SCOPE}.departments`}
              value={field.value ?? []}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="productCategoryId"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('product-category')}
            error={fieldState.error?.message}
          >
            <SelectCategory.InlineCell
              mode="single"
              scope={`${SCOPE}.productCategory`}
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="productId"
        render={({ field }) => (
          <PanelFormRow label={t('product')}>
            <SelectProduct.InlineCell
              mode="single"
              scope={`${SCOPE}.product`}
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <ReserveRemRemainderField control={form.control} />
    </SettingsPanelDraftForm>
  );
};

const ReserveRemEditForm = ({
  reserveRemId,
  defaultValues,
}: {
  reserveRemId: string;
  defaultValues: TReserveRemEditForm;
}) => {
  const { t } = useTranslation('accounting');
  const { closePanel } = useSettingsPanel(RESERVE_REM_CONTENT_TYPE);
  const { editReserveRem, loading } = useReserveRemEdit();
  const form = useForm<TReserveRemEditForm>({
    resolver: zodResolver(getReserveRemEditSchema(t)),
    defaultValues,
  });

  const handleSubmit = (data: TReserveRemEditForm) => {
    if (loading) {
      return;
    }

    if (isDeeplyEqual(data, defaultValues)) {
      closePanel();
      return;
    }

    editReserveRem({
      variables: {
        _id: reserveRemId,
        ...data,
        branchId: data.branchId || UNASSIGNED_LOCATION,
        departmentId: data.departmentId || UNASSIGNED_LOCATION,
      },
      onCompleted: closePanel,
    });
  };

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={closePanel}
      saving={loading}
    >
      <Form.Field
        control={form.control}
        name="productId"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('product')}
            required
            error={fieldState.error?.message}
          >
            <SelectProduct.InlineCell
              mode="single"
              scope={`${SCOPE}.product`}
              value={field.value}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <AdjustBranchDepartmentFields control={form.control} scope={SCOPE} />
      <Form.Field
        control={form.control}
        name="uom"
        render={({ field }) => (
          <PanelFormRow label={t('uom')}>
            <Input
              {...field}
              value={field.value ?? ''}
              autoComplete="off"
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <ReserveRemRemainderField control={form.control} />
    </SettingsPanelDraftForm>
  );
};

const ReserveRemPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { reserveRemDetail, loading } = useReserveRemDetail(contentId);

  if (!reserveRemDetail) {
    return loading ? <Spinner containerClassName="py-12" /> : null;
  }

  return (
    <ReserveRemEditForm
      key={reserveRemDetail._id}
      reserveRemId={reserveRemDetail._id}
      defaultValues={{
        productId: reserveRemDetail.productId ?? '',
        branchId: toFormLocation(reserveRemDetail.branchId),
        departmentId: toFormLocation(reserveRemDetail.departmentId),
        uom: reserveRemDetail.uom ?? '',
        remainder: reserveRemDetail.remainder ?? 0,
      }}
    />
  );
};

const ReserveRemPanelActions = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { removeReserveRems, loading } = useReserveRemsRemove();

  return (
    <SettingsPanelRemoveAction
      message={t('are-you-sure')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeReserveRems({ variables: { _ids: [contentId] }, onCompleted })
      }
    />
  );
};

export const RESERVE_REM_PANEL: ISettingsPanelViews = {
  addLabel: 'add-reserve-remainder',
  editLabel: 'edit-reserve-remainder',
  New: ReserveRemPanelNew,
  Actions: ReserveRemPanelActions,
  Detail: ReserveRemPanelDetail,
};
