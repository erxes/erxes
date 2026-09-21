import { CurrencyCode, CurrencyField, Form, InfoCard } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectCompany } from 'ui-modules/modules/contacts';
import { IProductFormValues } from '../types';
import {
  PRODUCT_SECONDARY_IMAGE_LIMIT,
  ProductPrimaryImageUpload,
  ProductSecondaryImagesUpload,
  toProductAttachmentItem,
  toProductAttachmentList,
  type ProductAttachmentItem,
} from './ProductImageUploads';
import {
  PRODUCT_VIDEO_LIMIT,
  ProductVideosUpload,
} from './ProductVideoUploads';

type AttachmentItem = ProductAttachmentItem;

function AddProductFeaturedImage({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const attachment = form.watch('attachment');
  const file = toProductAttachmentItem(
    attachment as Partial<AttachmentItem> | null | undefined,
  );

  const syncForm = useCallback(
    (next: AttachmentItem | null) => {
      form.setValue(
        'attachment',
        (next ?? '') as IProductFormValues['attachment'],
      );
    },
    [form],
  );

  return (
    <InfoCard title={t('primary-upload') || 'Primary Image'} className="h-full">
      <InfoCard.Content className="h-full">
        <ProductPrimaryImageUpload value={file} onChange={syncForm} />
      </InfoCard.Content>
    </InfoCard>
  );
}

function AddProductAttachmentMore({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const attachmentMore = form.watch('attachmentMore');

  const files = useMemo(
    () => toProductAttachmentList(attachmentMore),
    [attachmentMore],
  );

  const syncForm = useCallback(
    (next: AttachmentItem[]) => {
      form.setValue(
        'attachmentMore',
        next as IProductFormValues['attachmentMore'],
      );
    },
    [form],
  );

  return (
    <InfoCard
      title={t('secondary-upload') || 'Secondary Images'}
      className="h-full"
    >
      <InfoCard.Content className="h-full">
        <ProductSecondaryImagesUpload
          value={files}
          onChange={syncForm}
          maxImages={PRODUCT_SECONDARY_IMAGE_LIMIT}
        />
      </InfoCard.Content>
    </InfoCard>
  );
}

function AddProductVideos({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const videos = form.watch('videos');

  const files = useMemo(() => toProductAttachmentList(videos), [videos]);

  const syncForm = useCallback(
    (next: AttachmentItem[]) => {
      form.setValue('videos', next as IProductFormValues['videos']);
    },
    [form],
  );

  return (
    <InfoCard title={t('videos', 'Videos')} className="h-full">
      <InfoCard.Content className="h-full">
        <ProductVideosUpload
          value={files}
          onChange={syncForm}
          maxVideos={PRODUCT_VIDEO_LIMIT}
        />
      </InfoCard.Content>
    </InfoCard>
  );
}

export function AddProductFormAttachmentsAndExtra({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  return (
    <>
      <div className="grid grid-cols-3 gap-4 items-stretch pt-4">
        <div className="col-span-1 h-full">
          <AddProductFeaturedImage form={form} />
        </div>
        <div className="col-span-2 h-full">
          <AddProductAttachmentMore form={form} />
        </div>
      </div>
      <div className="pt-4">
        <AddProductVideos form={form} />
      </div>
      <div className="pt-4">
        <InfoCard title={t('more-info')}>
          <InfoCard.Content>
            <div className="grid grid-cols-3 gap-4">
              <Form.Field
                control={form.control}
                name="scopeBrandIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('brand')}</Form.Label>
                    <Form.Control>
                      <SelectBrand
                        value={field.value || []}
                        onValueChange={field.onChange}
                        mode="multiple"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('vendor')}</Form.Label>
                    <Form.Control>
                      <SelectCompany
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('currency')}</Form.Label>
                    <Form.Control>
                      <CurrencyField.SelectCurrency
                        value={field.value as CurrencyCode}
                        onChange={(value) => field.onChange(value)}
                        className="w-full"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>
    </>
  );
}
