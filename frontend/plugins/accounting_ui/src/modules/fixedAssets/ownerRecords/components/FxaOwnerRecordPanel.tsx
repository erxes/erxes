import { useTranslation, getI18n } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, InputNumber, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
  SelectMember,
  useSidePanelDraft,
} from 'ui-modules';
import { z } from 'zod';
import {
  FXA_OWNER_RECORD_CONTENT_TYPES,
  TFxaOwnerRecordActionMode,
} from '@/fixedAssets/ownerRecords/constants/ownerRecordPanel';
import {
  ISettingsPanelViews,
  SettingsPanelDraftForm,
} from '@/settings/components/panel/SettingsPanelLayout';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import {
  useFixedAssetOwnerRecordAdd,
  useFixedAssetOwnerRecordTransfer,
} from '@/settings/fixed-assets/hooks/useFixedAssetMutations';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const ownerRecordActionSchema = z
  .object({
    fixedAssetId: z.string(),
    code: z.string().optional(),
    sequence: z.number().optional(),
    count: z.number(),
    ownerId: z.string().optional(),
    fromOwnerId: z.string().optional(),
    toOwnerId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.fixedAssetId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getI18n().t('select-a-fixed-asset', {
          ns: 'accounting',
          nsSeparator: false,
        }),
        path: ['fixedAssetId'],
      });
    }

    if (value.count <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getI18n().t('quantity-must-be-greater-than-zero', {
          ns: 'accounting',
          nsSeparator: false,
        }),
        path: ['count'],
      });
    }

    if (!value.ownerId && !value.fromOwnerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getI18n().t('select-an-asset-custodian', {
          ns: 'accounting',
          nsSeparator: false,
        }),
        path: ['ownerId'],
      });
    }

    if (value.fromOwnerId !== undefined && !value.toOwnerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getI18n().t('select-the-receiving-custodian', {
          ns: 'accounting',
          nsSeparator: false,
        }),
        path: ['toOwnerId'],
      });
    }

    if (
      value.fromOwnerId &&
      value.toOwnerId &&
      value.fromOwnerId === value.toOwnerId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getI18n().t(
          'the-source-and-receiving-custodians-must-be-different',
          {
            ns: 'accounting',
            nsSeparator: false,
          },
        ),
        path: ['toOwnerId'],
      });
    }
  });

type TOwnerRecordActionForm = z.infer<typeof ownerRecordActionSchema>;

const ACTION_LABELS: Record<TFxaOwnerRecordActionMode, string> = {
  receive: 'assign-asset-custody',
  transfer: 'transfer-asset-custody',
  handOver: 'remove-asset-custody',
};

const FxaOwnerRecordForm = ({
  defaultValues,
  mode,
}: {
  defaultValues: Partial<TOwnerRecordActionForm>;
  mode: TFxaOwnerRecordActionMode;
}) => {
  const { t } = useTranslation('accounting');
  const { cancelDraft, closePanel } = useSettingsPanel(
    FXA_OWNER_RECORD_CONTENT_TYPES[mode],
  );
  const { addFixedAssetOwnerRecord, loading: addLoading } =
    useFixedAssetOwnerRecordAdd();
  const { transferFixedAssetOwnerRecord, loading: transferLoading } =
    useFixedAssetOwnerRecordTransfer();
  const loading = addLoading || transferLoading;
  const form = useForm<TOwnerRecordActionForm>({
    resolver: zodResolver(ownerRecordActionSchema),
    defaultValues: {
      fixedAssetId: '',
      code: '',
      count: 1,
      ...(mode === 'transfer'
        ? { fromOwnerId: '', toOwnerId: '' }
        : { ownerId: '' }),
      ...defaultValues,
    },
  });

  const handleInvalid = () => {
    toast({
      title: t('required-information-is-missing'),
      description: t('check-the-fixed-asset-quantity-and-custodian'),
      variant: 'destructive',
    });
  };

  const handleSubmit = (values: TOwnerRecordActionForm) => {
    if (mode === 'transfer') {
      if (!values.fromOwnerId || !values.toOwnerId) return handleInvalid();
      void transferFixedAssetOwnerRecord({
        variables: {
          fixedAssetId: values.fixedAssetId,
          code: values.code || undefined,
          sequence: values.sequence,
          count: values.count,
          fromOwnerId: values.fromOwnerId,
          toOwnerId: values.toOwnerId,
        },
        onCompleted: closePanel,
      });
      return;
    }

    if (!values.ownerId) return handleInvalid();
    void addFixedAssetOwnerRecord({
      variables: {
        fixedAssetId: values.fixedAssetId,
        code: values.code || undefined,
        sequence: values.sequence,
        count: values.count,
        action: mode === 'receive' ? 'received' : 'handedOver',
        status: 'active',
        ownerId: values.ownerId,
      },
      onCompleted: closePanel,
    });
  };

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onInvalid={handleInvalid}
      onCancel={cancelDraft}
      saving={loading}
      saveLabel={t('save')}
    >
      <Form.Field
        control={form.control}
        name="fixedAssetId"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('fixed-asset')}
            error={fieldState.error?.message}
          >
            <SelectFixedAsset.InlineCell
              mode="single"
              scope="fxaOwnerRecord.fixedAsset"
              value={field.value}
              onValueChange={(value) =>
                field.onChange(
                  Array.isArray(value) ? value[0] || '' : value || '',
                )
              }
              placeholder={t('fixed-asset')}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="count"
        render={({ field, fieldState }) => (
          <PanelFormRow label={t('quantity')} error={fieldState.error?.message}>
            <InputNumber
              value={field.value ?? 0}
              className={PANEL_INPUT_CLASS_NAME}
              onChange={(value) => field.onChange(value || 0)}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="code"
        render={({ field }) => (
          <PanelFormRow label={t('code')}>
            <Input
              {...field}
              value={field.value || ''}
              placeholder={t('code')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="sequence"
        render={({ field }) => (
          <PanelFormRow label={t('order')}>
            <InputNumber
              value={field.value}
              placeholder={t('order')}
              className={PANEL_INPUT_CLASS_NAME}
              onChange={(value) => field.onChange(value || undefined)}
            />
          </PanelFormRow>
        )}
      />
      {mode === 'transfer' ? (
        <>
          <Form.Field
            control={form.control}
            name="fromOwnerId"
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('hand-over')}
                error={fieldState.error?.message}
              >
                <SelectMember.InlineCell
                  mode="single"
                  scope="fxaOwnerRecord.fromOwner"
                  placeholder={t('hand-over')}
                  value={field.value || ''}
                  onValueChange={(value) => field.onChange(value || '')}
                />
              </PanelFormRow>
            )}
          />
          <Form.Field
            control={form.control}
            name="toOwnerId"
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('receive')}
                error={fieldState.error?.message}
              >
                <SelectMember.InlineCell
                  mode="single"
                  scope="fxaOwnerRecord.toOwner"
                  placeholder={t('receive')}
                  value={field.value || ''}
                  onValueChange={(value) => field.onChange(value || '')}
                />
              </PanelFormRow>
            )}
          />
        </>
      ) : (
        <Form.Field
          control={form.control}
          name="ownerId"
          render={({ field, fieldState }) => (
            <PanelFormRow
              label={t('asset-custodian')}
              error={fieldState.error?.message}
            >
              <SelectMember.InlineCell
                mode="single"
                scope="fxaOwnerRecord.owner"
                placeholder={t('asset-custodian')}
                value={field.value || ''}
                onValueChange={(value) => field.onChange(value || '')}
              />
            </PanelFormRow>
          )}
        />
      )}
    </SettingsPanelDraftForm>
  );
};

const FxaOwnerRecordPanelNew = ({
  mode,
}: {
  mode: TFxaOwnerRecordActionMode;
}) => {
  const defaultValues = useSidePanelDraft<TOwnerRecordActionForm>(
    FXA_OWNER_RECORD_CONTENT_TYPES[mode],
  );

  return (
    <FxaOwnerRecordForm
      key={JSON.stringify(defaultValues)}
      defaultValues={defaultValues}
      mode={mode}
    />
  );
};

const FxaOwnerRecordPanelDetail = () => null;

const getFxaOwnerRecordPanel = (
  mode: TFxaOwnerRecordActionMode,
): ISettingsPanelViews => ({
  addLabel: ACTION_LABELS[mode],
  editLabel: ACTION_LABELS[mode],
  New: () => <FxaOwnerRecordPanelNew mode={mode} />,
  Detail: FxaOwnerRecordPanelDetail,
});

export const FXA_OWNER_RECORD_PANELS: Record<string, ISettingsPanelViews> = {
  [FXA_OWNER_RECORD_CONTENT_TYPES.receive]: getFxaOwnerRecordPanel('receive'),
  [FXA_OWNER_RECORD_CONTENT_TYPES.transfer]: getFxaOwnerRecordPanel('transfer'),
  [FXA_OWNER_RECORD_CONTENT_TYPES.handOver]: getFxaOwnerRecordPanel('handOver'),
};
