import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCheck, IconRefresh } from '@tabler/icons-react';
import { Button, Combobox, Form, Popover, useMultiQueryState } from 'erxes-ui';
import {
  PanelFormRow,
  SelectBranches,
  SelectCategory,
  SelectDepartments,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { RECALC_REMAINDER_CONTENT_TYPE } from '@/inventories/remainders/constants/reCalcRemainderPanel';
import { useReCalcRemainders } from '@/inventories/remainders/hooks/useReCalcRemainders';
import { selectedProductIdsAtom } from '@/inventories/remainders/states/productCounts';
import { TReCalcRemainderForm } from '@/inventories/remainders/types/reCalcRemainderForm';
import { reCalcRemainderSchema } from '@/inventories/remainders/types/reCalcRemainderSchema';
import {
  ISettingsPanelViews,
  SettingsPanelDraftForm,
} from '@/settings/components/panel/SettingsPanelLayout';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const SCOPE = 'side-panel-recalc-remainder';

type TReCalcRemainderDraft = {
  branchId?: string;
  departmentId?: string;
  productIds?: string[];
};

const RecalcLocationSelect = ({
  kind,
  value,
  onValueChange,
}: {
  kind: 'branch' | 'department';
  value?: string;
  onValueChange: (value?: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const SelectLocation = kind === 'branch' ? SelectBranches : SelectDepartments;
  const emptyLabel =
    kind === 'branch' ? t('branch-not-assigned') : t('department-not-assigned');

  const handleChange = (nextValue?: string | string[]) => {
    if (typeof nextValue === 'string' || nextValue === undefined) {
      onValueChange(nextValue);
      setOpen(false);
    }
  };

  return (
    <SelectLocation
      mode="single"
      value={value === '_' ? undefined : value}
      onValueChange={handleChange}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          variant="ghost"
          hideChevron
          className={SETTINGS_PANEL_CELL_CLASS_NAME}
        >
          {value === '_' ? emptyLabel : <SelectLocation.Value />}
        </Combobox.Trigger>
        <Combobox.Content>
          <div className="border-b p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between"
              aria-pressed={value === '_'}
              onClick={() => handleChange(value === '_' ? '' : '_')}
            >
              {emptyLabel}
              {value === '_' && <IconCheck className="size-4" />}
            </Button>
          </div>
          <SelectLocation.Command disableCreateOption />
        </Combobox.Content>
      </Popover>
    </SelectLocation>
  );
};

export const ReCalcRemainderForm = () => {
  const { t } = useTranslation('accounting');
  const selectedProductIds = useAtomValue(selectedProductIdsAtom);
  const { openNewRecord } = useSidePanel();
  const [queries] = useMultiQueryState<{
    branchId?: string;
    departmentId?: string;
  }>(['branchId', 'departmentId']);

  const handleOpen = () =>
    openNewRecord(RECALC_REMAINDER_CONTENT_TYPE, {
      branchId: queries.branchId ?? '',
      departmentId: queries.departmentId ?? '',
      productIds: selectedProductIds,
    });

  return (
    <Button variant="outline" onClick={handleOpen}>
      <IconRefresh size={16} />
      {t('recalc-remainder')}
      {selectedProductIds.length > 0 && (
        <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 leading-none">
          {selectedProductIds.length}
        </span>
      )}
    </Button>
  );
};

const ReCalcRemainderPanelForm = ({
  draft,
}: {
  draft: TReCalcRemainderDraft;
}) => {
  const { t } = useTranslation('accounting');
  const { cancelDraft, closePanel } = useSettingsPanel(
    RECALC_REMAINDER_CONTENT_TYPE,
  );
  const { addSafeRemainder, loading } = useReCalcRemainders();
  const productIds = draft.productIds ?? [];
  const form = useForm<TReCalcRemainderForm>({
    resolver: zodResolver(reCalcRemainderSchema),
    defaultValues: {
      branchId: draft.branchId ?? '',
      departmentId: draft.departmentId ?? '',
    },
  });

  const handleSubmit = (data: TReCalcRemainderForm) => {
    if (loading) {
      return;
    }

    addSafeRemainder({
      variables: { ...data, ...(productIds.length ? { productIds } : {}) },
      onCompleted: closePanel,
    });
  };

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
      saveLabel={loading ? t('running') : t('run')}
    >
      <p className="px-2 pb-2 text-xs text-muted-foreground">
        {t('select-filters-to-recalculate')}
      </p>
      <PanelFormRow label={t('product')}>
        <span className="px-2 text-sm">
          {productIds.length
            ? `${productIds.length} ${t('selected')}`
            : t('all')}
        </span>
      </PanelFormRow>
      {(['branch', 'department'] as const).map((kind) => (
        <Form.Field
          key={kind}
          control={form.control}
          name={kind === 'branch' ? 'branchId' : 'departmentId'}
          render={({ field }) => (
            <PanelFormRow label={t(kind)}>
              <RecalcLocationSelect
                kind={kind}
                value={field.value}
                onValueChange={field.onChange}
              />
            </PanelFormRow>
          )}
        />
      ))}
      <Form.Field
        control={form.control}
        name="productCategoryId"
        render={({ field }) => (
          <PanelFormRow label={t('product-category')}>
            <SelectCategory.InlineCell
              mode="single"
              scope={`${SCOPE}.productCategory`}
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
    </SettingsPanelDraftForm>
  );
};

const ReCalcRemainderPanelNew = () => {
  const draft = useSidePanelDraft<TReCalcRemainderDraft>(
    RECALC_REMAINDER_CONTENT_TYPE,
  );

  return <ReCalcRemainderPanelForm key={JSON.stringify(draft)} draft={draft} />;
};

const ReCalcRemainderPanelDetail = () => null;

export const RECALC_REMAINDER_PANEL: ISettingsPanelViews = {
  addLabel: 'recalculate-remainders',
  editLabel: 'recalculate-remainders',
  New: ReCalcRemainderPanelNew,
  Detail: ReCalcRemainderPanelDetail,
};
