import { IAttachment, InfoCard } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PRODUCT_SECONDARY_IMAGE_LIMIT,
  ProductPrimaryImageUpload,
  ProductSecondaryImagesUpload,
  toProductAttachmentItem,
  toProductAttachmentList,
  type ProductAttachmentItem,
} from 'ui-modules/modules/products/components/ProductImageUploads';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';

export const ProductDetailAttachment = ({
  attachment,
  attachmentMore = [],
}: {
  attachment?: IAttachment | null;
  attachmentMore?: IAttachment[];
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();
  const [featured, setFeatured] = useState<ProductAttachmentItem | null>(() =>
    toProductAttachmentItem(attachment),
  );
  const [secondary, setSecondary] = useState<ProductAttachmentItem[]>(() =>
    toProductAttachmentList(attachmentMore),
  );

  useEffect(() => {
    setFeatured(toProductAttachmentItem(attachment));
  }, [attachment]);

  useEffect(() => {
    setSecondary(toProductAttachmentList(attachmentMore));
  }, [attachmentMore]);

  useEffect(() => {
    form.setValue('attachment', featured ?? undefined);
  }, [featured]);

  useEffect(() => {
    form.setValue('attachmentMore', secondary);
  }, [secondary]);

  return (
    <div className="grid grid-cols-1 gap-4 items-start md:grid-cols-3">
      <div className="md:col-span-1">
        <InfoCard title={t('featured-image')}>
          <InfoCard.Content>
            <ProductPrimaryImageUpload
              value={featured}
              onChange={setFeatured}
            />
          </InfoCard.Content>
        </InfoCard>
      </div>
      <div className="md:col-span-2">
        <InfoCard title={t('secondary-images')}>
          <InfoCard.Content>
            <ProductSecondaryImagesUpload
              value={secondary}
              onChange={setSecondary}
              maxImages={PRODUCT_SECONDARY_IMAGE_LIMIT}
            />
          </InfoCard.Content>
        </InfoCard>
      </div>
    </div>
  );
};
