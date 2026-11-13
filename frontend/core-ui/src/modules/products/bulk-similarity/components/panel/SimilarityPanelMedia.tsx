import { ScrollArea } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  type ProductAttachmentItem,
  ProductPrimaryImageUpload,
  ProductSecondaryImagesUpload,
  toProductAttachmentItem,
  toProductAttachmentList,
} from 'ui-modules/modules/products/components/ProductImageUploads';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';
import { BulkSimilarityFormValues } from '../../constants/bulkSimilaritySchema';

// The Media tab: the images every generated product gets.
export const SimilarityPanelMedia = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { control, setValue } = useFormContext<BulkSimilarityFormValues>();
  const [attachment, attachmentMore] = useWatch({
    control,
    name: ['attachment', 'attachmentMore'],
  });
  const change = (
    name: 'attachment' | 'attachmentMore',
    value: ProductAttachmentItem | ProductAttachmentItem[] | undefined,
  ) => setValue(name, value, { shouldDirty: true });

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <ContactDetailSection title={t('featured-image')}>
        <div className="h-48 w-full max-w-md">
          <ProductPrimaryImageUpload
            value={toProductAttachmentItem(attachment)}
            onChange={(value) => change('attachment', value ?? undefined)}
          />
        </div>
      </ContactDetailSection>
      <ContactDetailSection title={t('secondary-images')}>
        <ProductSecondaryImagesUpload
          value={toProductAttachmentList(attachmentMore)}
          onChange={(value) => change('attachmentMore', value)}
        />
      </ContactDetailSection>
    </ScrollArea>
  );
};
