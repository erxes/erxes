import { ScrollArea } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PRODUCT_SECONDARY_IMAGE_LIMIT,
  ProductPrimaryImageUpload,
  ProductSecondaryImagesUpload,
  toProductAttachmentItem,
  toProductAttachmentList,
} from 'ui-modules/modules/products/components/ProductImageUploads';
import {
  PRODUCT_VIDEO_LIMIT,
  ProductVideosUpload,
} from 'ui-modules/modules/products/components/ProductVideoUploads';
import { ProductFilesUpload } from 'ui-modules/modules/products/components/ProductFilesUpload';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';
import { useSavingValue } from '@/products/product-detail/hooks/useSavingValue';
import { TProductPanelFieldsProps } from './ProductPanelFields';

// The Media tab: each upload or removal saves on its own.
export const ProductPanelMedia = ({
  product,
  save,
}: TProductPanelFieldsProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const [featured, setFeatured] = useSavingValue(
    useMemo(
      () => toProductAttachmentItem(product.attachment),
      [product.attachment],
    ),
    (attachment) => save({ attachment }),
  );
  const [secondary, setSecondary] = useSavingValue(
    useMemo(
      () => toProductAttachmentList(product.attachmentMore),
      [product.attachmentMore],
    ),
    (attachmentMore) => save({ attachmentMore }),
  );
  const [videos, setVideos] = useSavingValue(
    useMemo(() => toProductAttachmentList(product.videos), [product.videos]),
    (videos) => save({ videos }),
  );
  const [files, setFiles] = useSavingValue(
    useMemo(() => toProductAttachmentList(product.files), [product.files]),
    (files) => save({ files }),
  );

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      {/* The panel's width, as in the product forms, at a fixed height so a
          wide panel does not grow it into a screen-sized square. */}
      <ContactDetailSection title={t('featured-image')}>
        <div className="h-48 w-full max-w-md">
          <ProductPrimaryImageUpload value={featured} onChange={setFeatured} />
        </div>
      </ContactDetailSection>
      <ContactDetailSection title={t('secondary-images')}>
        <ProductSecondaryImagesUpload
          value={secondary}
          onChange={setSecondary}
          maxImages={PRODUCT_SECONDARY_IMAGE_LIMIT}
        />
      </ContactDetailSection>
      <ContactDetailSection title={t('videos')}>
        <ProductVideosUpload
          value={videos}
          onChange={setVideos}
          maxVideos={PRODUCT_VIDEO_LIMIT}
        />
      </ContactDetailSection>
      <ContactDetailSection title={t('files')}>
        <ProductFilesUpload value={files} onChange={setFiles} />
      </ContactDetailSection>
    </ScrollArea>
  );
};
