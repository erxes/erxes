import { zodResolver } from '@hookform/resolvers/zod';
import { IconPackage, IconPlus } from '@tabler/icons-react';
import {
  Button,
  CurrencyField,
  Form,
  InfoCard,
  Input,
  ScrollArea,
  Select,
  Sheet,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  ProductPrimaryImageUpload,
  TagsSelect,
  type ProductAttachmentItem,
} from 'ui-modules';
import { IPackageProduct, PACKAGE_STATUSES } from '../types/Package';
import { useAddPackage } from '../hooks/usePackageMutations';
import { usePricing } from '../hooks/usePricing';
import { PackageProductPicker } from './PackageProductPicker';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  products: z
    .array(z.object({ productId: z.string(), quantity: z.number().min(1) }))
    .min(1, 'At least one product is required'),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(PACKAGE_STATUSES).default('active'),
});

type FormValues = z.infer<typeof schema>;

export const PackageAddSheet = () => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const [open, setOpen] = useState(false);
  const { addPackage, loading: saving } = useAddPackage();
  const pricing = usePricing();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      coverImage: '',
      products: [],
      tagIds: [],
      status: 'active',
    },
  });

  const products = form.watch('products');

  const handleClose = () => {
    setOpen(false);
    form.reset();
    pricing.reset();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await addPackage({
        variables: {
          name: values.name,
          description: values.description || undefined,
          coverImage: values.coverImage || undefined,
          products: values.products,
          tagIds: values.tagIds?.length ? values.tagIds : undefined,
          price: pricing.price ? Number(pricing.price) : undefined,
          percent: pricing.percent ? Number(pricing.percent) : undefined,
          status: values.status,
        },
      });
      toast({ variant: 'success', title: t('package-created', 'Package created') });
      handleClose();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: t('create-failed', 'Failed to create package'),
        description: e?.message,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('new-package', 'New package')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 sm:max-w-5xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-auto overflow-hidden"
          >
            <Sheet.Header className="flex gap-2">
              <IconPackage />
              <Sheet.Title>{t('new-package', 'New package')}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex flex-auto p-0 overflow-hidden">
              <ScrollArea className="border-r w-2/5 h-full shrink-0">
                <div className="flex flex-col gap-4 p-5">
                  <InfoCard title={t('basic-information', 'Basic information')}>
                    <InfoCard.Content>
                      <div className="grid grid-cols-2 gap-4">
                        <Form.Field
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>{t('name', 'Name')}</Form.Label>
                              <Form.Control>
                                <Input {...field} />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                        <Form.Field
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>{t('status', 'Status')}</Form.Label>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <Form.Control>
                                  <Select.Trigger className="h-8">
                                    <Select.Value />
                                  </Select.Trigger>
                                </Form.Control>
                                <Select.Content>
                                  {PACKAGE_STATUSES.map((s) => (
                                    <Select.Item key={s} value={s}>
                                      {s}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                        <Form.Field
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <Form.Item className="col-span-2">
                              <Form.Label>{t('description', 'Description')}</Form.Label>
                              <Form.Control>
                                <Textarea className="min-h-20" rows={4} {...field} />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                        <Form.Field
                          control={form.control}
                          name="tagIds"
                          render={({ field }) => (
                            <Form.Item className="col-span-2">
                              <Form.Label>{t('tags', 'Tags')}</Form.Label>
                              <TagsSelect.FormItem
                                type="core:product"
                                mode="multiple"
                                value={field.value || []}
                                onValueChange={(value) =>
                                  field.onChange(
                                    Array.isArray(value) ? value : value ? [value] : [],
                                  )
                                }
                              />
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      </div>
                    </InfoCard.Content>
                  </InfoCard>

                  <InfoCard title={t('cover-image', 'Cover image')}>
                    <InfoCard.Content>
                      <Form.Field
                        control={form.control}
                        name="coverImage"
                        render={({ field }) => (
                          <Form.Item>
                            <ProductPrimaryImageUpload
                              value={
                                field.value
                                  ? { name: field.value, url: field.value, type: '', size: 0 }
                                  : null
                              }
                              onChange={(v: ProductAttachmentItem | null) =>
                                field.onChange(v?.url || '')
                              }
                            />
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                    </InfoCard.Content>
                  </InfoCard>

                  <InfoCard title={t('pricing', 'Pricing')}>
                    <InfoCard.Content>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t('price', 'Price')}</span>
                            {pricing.displayTotal && (
                              <span className="text-xs text-muted-foreground tabular-nums line-through">
                                {pricing.displayTotal}
                              </span>
                            )}
                          </div>
                          <CurrencyField className="w-full">
                            <CurrencyField.ValueInput
                              className="w-full"
                              value={pricing.price ? Number(pricing.price) : 0}
                              onChange={pricing.onPriceChange}
                            />
                          </CurrencyField>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium">{t('percent', 'Percent')}</span>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.1"
                            placeholder="0"
                            value={pricing.percent}
                            onChange={(e) => pricing.onPercentChange(e.target.value)}
                          />
                        </div>
                      </div>
                    </InfoCard.Content>
                  </InfoCard>

                  <Form.Field
                    control={form.control}
                    name="products"
                    render={() => (
                      <Form.Item>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              </ScrollArea>

              <div className="flex flex-col flex-auto h-full overflow-hidden p-5 bg-muted/20">
                <PackageProductPicker
                  value={products}
                  onChange={(items: IPackageProduct[]) =>
                    form.setValue('products', items, { shouldValidate: true })
                  }
                  onTotalChange={pricing.onTotalChange}
                  disabled={saving}
                />
              </div>
            </Sheet.Content>

            <Sheet.Footer className="flex-none">
              <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Spinner containerClassName="flex-none" />}
                {t('create', 'Create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
