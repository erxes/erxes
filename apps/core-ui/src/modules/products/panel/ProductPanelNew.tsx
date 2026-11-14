import { ProductKind } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconPackage,
  IconTag,
} from '@tabler/icons-react';
import { Button, Form, Input, Select, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm, useFormContext, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CurrencySelect } from '~/components/RegionSelect';
import { messageOf } from '~/lib/api';
import { amountStep, fromAmountInput } from '~/lib/money';
import { useSession } from '~/modules/auth/session';
import { PanelFormRow } from '~/modules/side-panel/PanelForm';
import { NewContactForm } from '~/modules/side-panel/details/NewContactForm';
import { useCreatedPanelRecord } from '~/modules/side-panel/useCreatedPanelRecord';
import { CategoryPicker } from '../categories/CategoryPicker';
import { PRODUCT_CONTENT_TYPE, useOpenProduct, useProductCreate } from '../useProducts';
import { productFieldError } from './productErrors';

type Translate = (key: string, defaultValue: string) => string;

/** A typed price (empty is free) with no more decimals than the currency has. */
const isPrice = (text: string, currency: string) => {
  const value = Number(text || '0');

  return (
    Number.isFinite(value) &&
    value >= 0 &&
    Math.abs(value / amountStep(currency) - fromAmountInput(text || '0', currency)) < 1e-6
  );
};

const newProductSchema = (t: Translate) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('form.name-required', 'Enter a name'))
        .max(200, t('form.too-long', 'Too long')),
      kind: ProductKind,
      price: z.string().trim(),
      currency: z.string(),
      code: z.string().trim().max(100, t('form.too-long', 'Too long')),
      categoryId: z.string().nullable(),
    })
    .refine((values) => isPrice(values.price, values.currency), {
      path: ['price'],
      error: t('form.price-invalid', 'Enter a price, like 12.50'),
    });

type TNewProduct = z.infer<ReturnType<typeof newProductSchema>>;

/** Creates the product; a code another product has shows under Code, with a way to open that one. */
const useProductSave = (form: UseFormReturn<TNewProduct>) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const create = useProductCreate();
  const showCreated = useCreatedPanelRecord(PRODUCT_CONTENT_TYPE);
  const [existingId, setExistingId] = useState<string | null>(null);

  const save = async (values: TNewProduct) => {
    setExistingId(null);

    try {
      const created = await create.mutateAsync({
        name: values.name,
        kind: values.kind,
        code: values.code || null,
        categoryId: values.categoryId,
        price: fromAmountInput(values.price || '0', values.currency),
        currency: values.currency,
      });

      showCreated(created.id);
    } catch (error) {
      const fieldError = productFieldError(error, t);

      if (fieldError?.field === 'code') {
        form.setError('code', { message: fieldError.message });
        setExistingId(fieldError.productId ?? null);

        return;
      }

      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save the product'),
        description: fieldError?.message ?? messageOf(error),
      });
    }
  };

  return { save, saving: create.isPending, existingId };
};

const KindRow = () => {
  const { t } = useTranslation('product');
  const { control } = useFormContext<TNewProduct>();

  return (
    <PanelFormRow icon={IconTag} label={t('fields.kind', 'Kind')}>
      <Form.Field
        control={control}
        name="kind"
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value) => {
              if (value === 'goods' || value === 'service') field.onChange(value);
            }}
          >
            <Select.Trigger variant="bordered" ><Select.Value /></Select.Trigger>
            <Select.Content align="start">
              <Select.Item value="goods" className="h-7">
                {t('kind.goods', 'Goods')}
              </Select.Item>
              <Select.Item value="service" className="h-7">
                {t('kind.service', 'Service')}
              </Select.Item>
            </Select.Content>
          </Select>
        )}
      />
    </PanelFormRow>
  );
};

/** Where the product sits in the catalog's category tree, or none. */
const CategoryRow = () => {
  const { t } = useTranslation('product');
  const { control } = useFormContext<TNewProduct>();

  return (
    <PanelFormRow icon={IconCategory} label={t('fields.category', 'Category')}>
      <Form.Field
        control={control}
        name="categoryId"
        render={({ field }) => (
          <CategoryPicker
            value={field.value}
            onChange={field.onChange}
            noneLabel={t('category.none', 'No category')}
            variant="bordered"
            className="h-7"
          />
        )}
      />
    </PanelFormRow>
  );
};

/** The price as people type it, in the currency beside it (the organisation's to start). */
const PriceRow = () => {
  const { t } = useTranslation('product');
  const { control, register, formState } = useFormContext<TNewProduct>();
  const currency = useWatch({ control, name: 'currency' });

  return (
    <PanelFormRow
      icon={IconCurrencyDollar}
      label={t('fields.price', 'Price')}
      error={formState.errors.price?.message}
    >
      <div className="flex gap-1">
        <Input {...register('price')}
        type="number"
        min={0}
        step={amountStep(currency)}
        inputMode="decimal"
        placeholder="0" variant="bordered" text="sm"  />
        <Form.Field
          control={control}
          name="currency"
          render={({ field }) => (
            <div className="w-24 flex-none">
              <CurrencySelect
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </div>
    </PanelFormRow>
  );
};

/**
 * A product not created yet: its name, kind, price and code. Nothing is saved
 * until Create; the product then takes the draft's place, with every other field.
 */
export const ProductPanelNew = () => {
  const { t } = useTranslation('product');
  const { organization } = useSession();
  const { openProduct } = useOpenProduct();

  const form = useForm<TNewProduct>({
    resolver: zodResolver(newProductSchema(t)),
    defaultValues: {
      name: '',
      kind: 'goods',
      price: '',
      currency: organization.currency,
      code: '',
      categoryId: null,
    },
  });

  const { save, saving, existingId } = useProductSave(form);
  const { errors } = form.formState;

  return (
    <NewContactForm
      form={form}
      onSave={save}
      saving={saving}
      saveLabel={t('actions.create', 'Create product')}
    >
      <PanelFormRow
        icon={IconPackage}
        label={t('fields.name', 'Name')}
        required
        error={errors.name?.message}
      >
        <Input {...form.register('name')}
        placeholder={t('fields.name', 'Name')} variant="bordered" text="sm"  />
      </PanelFormRow>
      <KindRow />
      <CategoryRow />
      <PriceRow />
      <PanelFormRow icon={IconHash} label={t('fields.code', 'Code')} error={errors.code?.message}>
        <Input {...form.register('code')}
        placeholder={t('fields.code', 'Code')} variant="bordered" text="sm"  />
      </PanelFormRow>
      {existingId && (
        // Under the code's input: past its label column (6.5rem) and gap.
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-28 h-6 self-start px-1 text-xs text-primary-text"
          onClick={() => openProduct(existingId, { stack: true })}
        >
          {t('form.open-existing', 'Open that product')}
        </Button>
      )}
    </NewContactForm>
  );
};
