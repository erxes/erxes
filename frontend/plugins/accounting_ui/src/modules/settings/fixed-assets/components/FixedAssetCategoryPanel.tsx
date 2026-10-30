import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isDeeplyEqual, Spinner, toast } from 'erxes-ui';
import { FixedAssetCategoryForm } from '@/settings/fixed-assets/components/FixedAssetCategoryForm';
import { FIXED_ASSET_CATEGORY_DEFAULT_VALUES } from '@/settings/fixed-assets/constants/defaultValues';
import { fixedAssetCategorySchema } from '@/settings/fixed-assets/constants/schema';
import { useFixedAssetCategoryDetail } from '@/settings/fixed-assets/hooks/useFixedAssetCategoryDetail';
import {
  useFixedAssetCategoryAdd,
  useFixedAssetCategoryEdit,
} from '@/settings/fixed-assets/hooks/useFixedAssetMutations';
import { TFixedAssetCategoryForm } from '@/settings/fixed-assets/types/FixedAsset';
import { getUsefulLifeFromRate } from '@/settings/fixed-assets/utils/depreciationRate';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { FIXED_ASSET_CATEGORY_CONTENT_TYPE } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const FixedAssetCategoryPanelNew = () => {
  const { cancelDraft, closePanel } = useSettingsPanel(
    FIXED_ASSET_CATEGORY_CONTENT_TYPE,
  );
  const form = useForm<TFixedAssetCategoryForm>({
    resolver: zodResolver(fixedAssetCategorySchema),
    defaultValues: FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
  });
  const { addFixedAssetCategory, loading } = useFixedAssetCategoryAdd();

  const handleSubmit = (data: TFixedAssetCategoryForm) => {
    addFixedAssetCategory({
      variables: data,
      onCompleted: () => {
        form.reset();
        closePanel();
      },
    });
  };

  return (
    <FixedAssetCategoryForm
      form={form}
      handleSubmit={handleSubmit}
      onCancel={cancelDraft}
      loading={loading}
    />
  );
};

const FixedAssetCategoryPanelDetail = ({
  contentId,
}: ISettingsPanelViewProps) => {
  const { closePanel } = useSettingsPanel(FIXED_ASSET_CATEGORY_CONTENT_TYPE);
  const { fixedAssetCategoryDetail, loading } =
    useFixedAssetCategoryDetail(contentId);
  const { editFixedAssetCategory, loading: editLoading } =
    useFixedAssetCategoryEdit();
  const form = useForm<TFixedAssetCategoryForm>({
    resolver: zodResolver(fixedAssetCategorySchema),
    defaultValues: FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (fixedAssetCategoryDetail) {
      const parsed = fixedAssetCategorySchema.partial().safeParse({
        ...FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
        ...fixedAssetCategoryDetail,
        defaultUsefulLife: getUsefulLifeFromRate(
          fixedAssetCategoryDetail.defaultAnnualDepreciationRate,
        ),
        defaultTaxUsefulLife: getUsefulLifeFromRate(
          fixedAssetCategoryDetail.defaultTaxAnnualDepreciationRate,
        ),
      });
      if (parsed.success) reset(parsed.data);
      else
        toast({
          title: 'Invalid fixed asset data',
          description: parsed.error.message,
          variant: 'destructive',
        });
    }
  }, [fixedAssetCategoryDetail, reset]);

  const handleSubmit = (data: TFixedAssetCategoryForm) => {
    if (!fixedAssetCategoryDetail?._id) return;
    const initialData = {
      ...FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
      ...fixedAssetCategoryDetail,
      defaultUsefulLife: getUsefulLifeFromRate(
        fixedAssetCategoryDetail?.defaultAnnualDepreciationRate,
      ),
      defaultTaxUsefulLife: getUsefulLifeFromRate(
        fixedAssetCategoryDetail?.defaultTaxAnnualDepreciationRate,
      ),
    };

    if (isDeeplyEqual({ ...initialData, ...data }, initialData)) {
      reset();
      return closePanel();
    }

    editFixedAssetCategory({
      variables: {
        _id: fixedAssetCategoryDetail._id,
        ...data,
      },
      onCompleted: () => {
        closePanel();
        reset();
      },
    });
  };

  if (loading && !fixedAssetCategoryDetail) {
    return <Spinner containerClassName="py-12" />;
  }

  return (
    <FixedAssetCategoryForm
      form={form}
      handleSubmit={handleSubmit}
      onCancel={closePanel}
      loading={editLoading}
    />
  );
};

export const FIXED_ASSET_CATEGORY_PANEL: ISettingsPanelViews = {
  addLabel: 'add-fixed-asset-category',
  editLabel: 'edit-fixed-asset-category',
  New: FixedAssetCategoryPanelNew,
  Detail: FixedAssetCategoryPanelDetail,
};
