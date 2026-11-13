import { ScrollArea } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ProductAttachmentItem,
  ProductPrimaryImageUpload,
} from 'ui-modules/modules/products/components/ProductImageUploads';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';
import { useSavingValue } from '@/products/product-detail/hooks/useSavingValue';
import { TPackagePanelProps } from './PackagePanelFields';

// A package keeps its cover image as a URL.
const toAttachment = (url?: string): ProductAttachmentItem | null =>
  url ? { name: url, url, type: '', size: 0 } : null;

// The Media tab: the cover image, saved as it is uploaded or removed.
export const PackagePanelMedia = ({
  pkg,
  save,
}: Pick<TPackagePanelProps, 'pkg' | 'save'>) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const [cover, setCover] = useSavingValue(
    useMemo(() => toAttachment(pkg.coverImage), [pkg.coverImage]),
    (attachment) => save({ coverImage: attachment?.url || '' }),
  );

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <ContactDetailSection title={t('cover-image')}>
        <div className="h-48 w-full max-w-md">
          <ProductPrimaryImageUpload value={cover} onChange={setCover} />
        </div>
      </ContactDetailSection>
    </ScrollArea>
  );
};
