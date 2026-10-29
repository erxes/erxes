import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PanelField } from 'ui-modules';
import { SettingsPanelRemoveAction } from '@/settings/components/panel/SettingsPanelActions';
import {
  SettingsPanelDescriptionField,
  SettingsPanelNumberField,
  SettingsPanelSelect,
  SettingsPanelTextField,
} from '@/settings/components/panel/SettingsPanelFields';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDetailLayout,
} from '@/settings/components/panel/SettingsPanelLayout';
import {
  FIXED_ASSET_CATEGORY_CONTENT_TYPE,
  SETTINGS_PANEL_CELL_CLASS_NAME,
} from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { FixedAssetCategoryForm } from '@/settings/fixed-assets/components/FixedAssetCategoryForm';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';
import { FIXED_ASSET_CATEGORY_DEPRECIATION_FIELDS } from '@/settings/fixed-assets/constants/categoryDepreciationFields';
import { FIXED_ASSET_CATEGORY_DEFAULT_VALUES } from '@/settings/fixed-assets/constants/defaultValues';
import { getDepreciationMethodOptions } from '@/settings/fixed-assets/constants/depreciationMethods';
import { fixedAssetCategorySchema } from '@/settings/fixed-assets/constants/schema';
import { useFixedAssetCategoryDetail } from '@/settings/fixed-assets/hooks/useFixedAssetCategoryDetail';
import {
  useFixedAssetCategoryAdd,
  useFixedAssetCategoryEdit,
  useFixedAssetCategoryRemove,
} from '@/settings/fixed-assets/hooks/useFixedAssetMutations';
import {
  IFixedAssetCategory,
  TFixedAssetCategoryForm,
} from '@/settings/fixed-assets/types/FixedAsset';
import {
  getRateFromUsefulLife,
  getUsefulLifeFromRate,
} from '@/settings/fixed-assets/utils/depreciationRate';

const SCOPE = 'side-panel-fixed-asset-category';

type TFixedAssetCategoryPanelChange = Partial<
  Omit<TFixedAssetCategoryForm, 'defaultUsefulLife' | 'defaultTaxUsefulLife'>
>;

const FixedAssetCategoryPanelNew = () => {
  const { openDetail, cancelDraft } = useSettingsPanel(
    FIXED_ASSET_CATEGORY_CONTENT_TYPE,
  );
  const { addFixedAssetCategory, loading } = useFixedAssetCategoryAdd();
  const form = useForm<TFixedAssetCategoryForm>({
    resolver: zodResolver(fixedAssetCategorySchema),
    defaultValues: FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
  });

  const handleSubmit = (data: TFixedAssetCategoryForm) => {
    if (loading) {
      return;
    }

    addFixedAssetCategory({
      variables: data,
      onCompleted: ({ fixedAssetCategoriesAdd }) => {
        if (fixedAssetCategoriesAdd?._id) {
          openDetail(fixedAssetCategoriesAdd._id, { replace: true });
        }
      },
    });
  };

  return (
    <FixedAssetCategoryForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    />
  );
};

const FixedAssetCategoryPanelActions = ({
  contentId,
}: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { removeFixedAssetCategory, loading } = useFixedAssetCategoryRemove();

  return (
    <SettingsPanelRemoveAction
      message={t('delete-this-fixed-asset-category')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeFixedAssetCategory({
          variables: { _id: contentId },
          onCompleted,
        })
      }
    />
  );
};

const DepreciationPanelFields = ({
  category,
  fields,
  onSave,
}: {
  category: IFixedAssetCategory;
  fields: (typeof FIXED_ASSET_CATEGORY_DEPRECIATION_FIELDS)[number];
  onSave: (change: TFixedAssetCategoryPanelChange) => void;
}) => {
  const { t } = useTranslation('accounting');
  const rate = category[fields.rate];

  const saveRate = (next?: number) =>
    next !== rate && onSave({ [fields.rate]: next });

  return (
    <>
      <PanelField label={t(fields.methodLabel)}>
        <SettingsPanelSelect
          value={category[fields.method]}
          placeholder={t(fields.methodPlaceholder)}
          options={getDepreciationMethodOptions(t)}
          onValueChange={(method) => onSave({ [fields.method]: method })}
        />
      </PanelField>
      <PanelField label={t(fields.usefulLifeLabel)}>
        <SettingsPanelNumberField
          scope={`${SCOPE}.${fields.usefulLife}`}
          value={getUsefulLifeFromRate(rate)}
          min={0}
          placeholder={t(fields.usefulLifeLabel)}
          onSave={(usefulLife) => saveRate(getRateFromUsefulLife(usefulLife))}
        />
      </PanelField>
      <PanelField label={t(fields.rateLabel)}>
        <SettingsPanelNumberField
          scope={`${SCOPE}.${fields.rate}`}
          value={rate}
          min={0}
          placeholder={t(fields.rateLabel)}
          onSave={saveRate}
        />
      </PanelField>
      <PanelField label={t(fields.salvageLabel)}>
        <SettingsPanelNumberField
          scope={`${SCOPE}.${fields.salvage}`}
          value={category[fields.salvage]}
          min={0}
          placeholder={t(fields.salvageLabel)}
          onSave={(salvage) => onSave({ [fields.salvage]: salvage })}
        />
      </PanelField>
    </>
  );
};

const FixedAssetCategoryPanelDetail = ({
  contentId,
}: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { fixedAssetCategoryDetail: category, loading } =
    useFixedAssetCategoryDetail(contentId);
  const { editFixedAssetCategory } = useFixedAssetCategoryEdit();

  const save = (
    current: IFixedAssetCategory,
    fields: TFixedAssetCategoryPanelChange,
  ) =>
    editFixedAssetCategory({
      variables: {
        _id: current._id,
        code: current.code ?? '',
        name: current.name ?? '',
        description: current.description,
        parentId: current.parentId,
        status: current.status,
        depreciationMethod: current.depreciationMethod,
        defaultAnnualDepreciationRate: current.defaultAnnualDepreciationRate,
        defaultSalvageValue: current.defaultSalvageValue,
        taxDepreciationMethod: current.taxDepreciationMethod,
        defaultTaxAnnualDepreciationRate:
          current.defaultTaxAnnualDepreciationRate,
        defaultTaxSalvageValue: current.defaultTaxSalvageValue,
        ...fields,
      },
    });

  return (
    <SettingsPanelDetailLayout loading={loading} hasRecord={!!category}>
      {category && (
        <>
          <PanelField label={t('name')}>
            <SettingsPanelTextField
              scope={`${SCOPE}.name`}
              value={category.name || ''}
              placeholder={t('name')}
              onSave={(name) => name.trim() && save(category, { name })}
            />
          </PanelField>
          <PanelField label={t('code')}>
            <SettingsPanelTextField
              scope={`${SCOPE}.code`}
              value={category.code || ''}
              placeholder={t('code')}
              onSave={(code) => code.trim() && save(category, { code })}
            />
          </PanelField>
          <PanelField label={t('parent-category')}>
            <SelectFixedAssetCategory
              recordId={category._id}
              selected={category.parentId || undefined}
              nullable
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
              onSelect={(parentId = '') =>
                parentId !== (category.parentId || '') &&
                save(category, { parentId })
              }
            />
          </PanelField>
          {FIXED_ASSET_CATEGORY_DEPRECIATION_FIELDS.map((fields) => (
            <DepreciationPanelFields
              key={fields.method}
              category={category}
              fields={fields}
              onSave={(change) => save(category, change)}
            />
          ))}
          <SettingsPanelDescriptionField
            key={category._id}
            value={category.description || ''}
            onSave={(description) => save(category, { description })}
          />
        </>
      )}
    </SettingsPanelDetailLayout>
  );
};

export const FIXED_ASSET_CATEGORY_PANEL: ISettingsPanelViews = {
  addLabel: 'add-fixed-asset-category',
  editLabel: 'edit-fixed-asset-category',
  New: FixedAssetCategoryPanelNew,
  Actions: FixedAssetCategoryPanelActions,
  Detail: FixedAssetCategoryPanelDetail,
};
