import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconBarcode,
  IconCategory,
  IconPackage,
  IconTextCaption,
} from '@tabler/icons-react';
import { Form, Input } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PanelFormLayout,
  PanelFormRow,
  SelectCategory,
  SelectProduct,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { z } from 'zod';
import { renderPosPanelStatus } from '@/pos/components/PosPanelMissing';
import { usePosPanelSave } from '@/pos/hooks/usePosPanelSave';
import {
  type CatProdMappingDraft,
  toCatProdMappings,
  toCatProdMappingsInput,
} from '@/pos/components/products/catProdMappings';
import {
  POS_CATEGORY_MAPPING_CONTENT_TYPE,
  POS_PANEL_INPUT_CLASS_NAME,
} from '@/pos/constants/posPanel';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

interface MappingFormValues {
  categoryId: string;
  code: string;
  name: string;
  productId: string;
}

const EMPTY_VALUES: MappingFormValues = {
  categoryId: '',
  code: '',
  name: '',
  productId: '',
};

const firstId = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || '';

export const PosCategoryMappingPanelTitle = () => {
  const { t } = useTranslation('sales');
  const { mappingId } = useSidePanelDraft<CatProdMappingDraft>(
    POS_CATEGORY_MAPPING_CONTENT_TYPE,
  );

  return mappingId ? t('edit-mapping') : t('add-mapping');
};

export const PosCategoryMappingPanel = () => {
  const { t } = useTranslation('sales');
  const { posId, mappingId } = useSidePanelDraft<CatProdMappingDraft>(
    POS_CATEGORY_MAPPING_CONTENT_TYPE,
  );
  const { back, canGoBack, close } = useSidePanel();
  const { posDetail, loading, error } = usePosDetail(posId);

  const mappings = useMemo(
    () => toCatProdMappings(posDetail?.catProdMappings),
    [posDetail?.catProdMappings],
  );
  const editing = mappings.find((mapping) => mapping._id === mappingId);

  const schema = useMemo(
    () =>
      z.object({
        categoryId: z.string(),
        code: z.string(),
        name: z.string().trim().min(1, t('product-name-required')),
        productId: z.string(),
      }),
    [t],
  );

  const form = useForm<MappingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (editing) {
      form.reset({
        categoryId: editing.categoryId,
        code: editing.code || '',
        name: editing.name || '',
        productId: editing.productId,
      });
    }
  }, [editing, form]);

  const cancel = () => (canGoBack ? back() : close());
  const { save: savePos, saving } = usePosPanelSave({
    successMessage: t('product-settings-saved'),
    failureMessage: t('product-settings-save-failed'),
    onSaved: cancel,
  });
  const status = renderPosPanelStatus({
    missing: !posId || (!!mappingId && !loading && !editing),
    loading,
    error,
    onCancel: cancel,
  });

  if (status || !posId) {
    return status;
  }

  const save = (values: MappingFormValues) => {
    const next = { ...values, _id: editing?._id || nanoid() };
    const nextMappings = editing
      ? mappings.map((mapping) =>
          mapping._id === editing._id ? next : mapping,
        )
      : [...mappings, next];

    return savePos({
      _id: posId,
      catProdMappings: toCatProdMappingsInput(nextMappings),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(save)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={cancel}
          saving={saving}
          saveLabel={editing ? t('update-mapping') : t('add-mapping')}
        >
          <PanelFormRow icon={IconCategory} label={t('category')}>
            <SelectCategory
              mode="single"
              value={form.watch('categoryId')}
              onValueChange={(value) =>
                form.setValue('categoryId', firstId(value))
              }
            />
          </PanelFormRow>
          <PanelFormRow icon={IconBarcode} label={t('code')}>
            <Input
              {...form.register('code')}
              placeholder={t('enter-product-code-pattern')}
              className={POS_PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          <PanelFormRow
            icon={IconTextCaption}
            label={t('name')}
            required
            error={errors.name?.message}
          >
            <Input
              {...form.register('name')}
              placeholder={t('enter-product-name-pattern')}
              className={POS_PANEL_INPUT_CLASS_NAME}
              aria-invalid={!!errors.name}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconPackage} label={t('product')}>
            <SelectProduct
              mode="single"
              value={form.watch('productId')}
              onValueChange={(value: string | string[]) =>
                form.setValue('productId', firstId(value))
              }
            />
          </PanelFormRow>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
