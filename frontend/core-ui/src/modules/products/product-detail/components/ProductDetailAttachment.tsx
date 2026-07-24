import { InfoCard } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PRODUCT_SECONDARY_IMAGE_LIMIT,
  PRODUCT_VIDEO_LIMIT,
  ProductPrimaryImageUpload,
  ProductSecondaryImagesUpload,
  ProductVideosUpload,
  toProductAttachmentItem,
  toProductAttachmentList,
  type ProductAttachmentItem,
} from 'ui-modules/modules/products/components/ProductImageUploads';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { ProductAttachment } from '../types/detailTypes';

export const ProductDetailAttachment = ({
  attachment,
  attachmentMore = [],
  videos = [],
}: {
  attachment?: ProductAttachment | null;
  attachmentMore?: ProductAttachment[] | ProductAttachment | null;
  videos?: ProductAttachment[] | ProductAttachment | null;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();
  const [featured, setFeatured] = useState<ProductAttachmentItem | null>(() =>
    toProductAttachmentItem(attachment),
  );
  const [secondary, setSecondary] = useState<ProductAttachmentItem[]>(() =>
    toProductAttachmentList(attachmentMore),
  );
  const [videoItems, setVideoItems] = useState<ProductAttachmentItem[]>(() =>
    toProductAttachmentList(videos),
  );

  useEffect(() => {
    setFeatured(toProductAttachmentItem(attachment));
  }, [attachment]);

  useEffect(() => {
    setSecondary(toProductAttachmentList(attachmentMore));
  }, [attachmentMore]);

  useEffect(() => {
    setVideoItems(toProductAttachmentList(videos));
  }, [videos]);

  useEffect(() => {
    form.setValue('attachment', featured ?? undefined);
  }, [featured]);

  useEffect(() => {
    form.setValue('attachmentMore', secondary);
  }, [secondary]);

  useEffect(() => {
    form.setValue('videos', videoItems);
  }, [videoItems]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 items-stretch md:grid-cols-3">
        <div className="h-full md:col-span-1">
          <InfoCard title={t('featured-image')} className="h-full">
            <InfoCard.Content className="h-full">
              <ProductPrimaryImageUpload
                value={featured}
                onChange={setFeatured}
              />
            </InfoCard.Content>
          </InfoCard>
        </div>
        <div className="h-full md:col-span-2">
          <InfoCard title={t('secondary-images')} className="h-full">
            <InfoCard.Content className="h-full">
              <ProductSecondaryImagesUpload
                value={secondary}
                onChange={setSecondary}
                maxImages={PRODUCT_SECONDARY_IMAGE_LIMIT}
              />
            </InfoCard.Content>
          </InfoCard>
        </div>
      </div>
      <InfoCard title={t('videos') || 'Videos'} className="h-full">
        <InfoCard.Content className="h-full">
          <ProductVideosUpload
            value={videoItems}
            onChange={setVideoItems}
            maxVideos={PRODUCT_VIDEO_LIMIT}
          />
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
