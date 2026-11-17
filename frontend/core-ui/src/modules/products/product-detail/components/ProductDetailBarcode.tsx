import { IconBarcode, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Input,
  Select,
  TextOverflowTooltip,
  useToast,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { ProductDetail } from '../types/detailTypes';
import { toProductAttachmentList } from 'ui-modules/modules/products/components/ProductImageUploads';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';

type BarcodeItem = {
  code: string;
  name?: string;
  image?: {
    url: string;
    name?: string;
  };
};

const normalizeBarcodes = (
  barcodes: string[] | string | undefined,
): string[] => {
  if (Array.isArray(barcodes)) return barcodes;
  if (barcodes) return [barcodes];
  return [];
};

type VariantsMap = Record<
  string,
  { name?: string; image?: { url: string; name?: string } }
>;

type ImageItem = { url: string; name?: string };

// One barcode: its code, then the variant's name and image beside each other.
const BarcodeRow = ({
  barcode,
  index,
  availableImages,
  t,
  onUpdate,
  onRemove,
}: {
  barcode: BarcodeItem;
  index: number;
  availableImages: ImageItem[];
  t: (key: string) => string;
  onUpdate: (
    index: number,
    field: 'name' | 'image',
    value: string | ImageItem | undefined,
  ) => void;
  onRemove: (index: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border p-2">
      <div className="flex min-w-0 items-center gap-2">
        <IconBarcode
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <TextOverflowTooltip
          value={barcode.code}
          className="min-w-0 flex-1 font-mono text-xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 text-destructive hover:text-destructive"
          aria-label={t('remove-barcode')}
          onClick={() => onRemove(index)}
        >
          <IconTrash />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <TextOverflowTooltip.Input
          value={barcode.name || ''}
          onChange={(value) => onUpdate(index, 'name', value || undefined)}
          placeholder={t('enter-name')}
          aria-label={t('name')}
        />
        <Select
          value={barcode.image?.url || ''}
          onValueChange={(imageUrl) => {
            const selectedImage = availableImages.find(
              (img) => img.url === imageUrl,
            );
            onUpdate(index, 'image', selectedImage || undefined);
          }}
          disabled={availableImages.length === 0}
        >
          <Select.Trigger className="w-full" aria-label={t('barcode-image')}>
            <Select.Value
              placeholder={
                availableImages.length > 0 ? t('select-image') : t('no-image')
              }
            >
              {barcode.image?.name}
            </Select.Value>
          </Select.Trigger>
          <Select.Content>
            {availableImages.map((img) => (
              <Select.Item key={img.url} value={img.url}>
                {img.name || img.url}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </div>
  );
};

export const ProductDetailBarcode = ({
  productDetail,
  resetKey = 0,
}: {
  productDetail: ProductDetail;
  // Changed when the form is reset, so the editor shows the reset text:
  // it takes `initialContent` again only when that is not empty.
  resetKey?: number;
}) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const { toast } = useToast();
  const form = useFormContext<ProductFormValues>();
  const variants = (form.watch('variants') as VariantsMap) ?? {};

  const formBarcodes = normalizeBarcodes(form.watch('barcodes'));
  const formVariants = variants;
  const formBarcodeDescription = form.watch('barcodeDescription') ?? '';
  const formAttachmentMore = form.watch('attachmentMore');

  const [hasEditedVariants, setHasEditedVariants] = useState(false);

  useEffect(() => {
    setHasEditedVariants(false);
  }, [productDetail?._id]);

  const variantsFromProduct: VariantsMap =
    (productDetail?.variants as VariantsMap) || {};

  const variantsForDisplay = hasEditedVariants
    ? formVariants
    : variantsFromProduct;

  const attachmentMore = useMemo(
    () => toProductAttachmentList(formAttachmentMore),
    [formAttachmentMore],
  );

  const availableImages = useMemo(() => {
    return attachmentMore.filter(
      (x: unknown): x is { url: string; name?: string } =>
        x != null && typeof x === 'object' && 'url' in x,
    );
  }, [attachmentMore]);

  const [code, setCode] = useState('');

  const barcodeItems: BarcodeItem[] = useMemo(() => {
    return formBarcodes.map((codeValue) => {
      const variant = variantsForDisplay[codeValue];
      return {
        code: codeValue,
        name: variant?.name,
        image: variant?.image,
      };
    });
  }, [formBarcodes, variantsForDisplay]);

  const isAddDisabled = !code.trim();

  const syncBarcodesAndVariants = (
    newBarcodes: string[],
    newVariants: VariantsMap,
  ) => {
    form.setValue('barcodes', newBarcodes);
    form.setValue('variants', newVariants);
  };

  const handleAddBarcode = () => {
    if (!code.trim()) return;

    const codeValue = code.trim();
    const isDuplicate =
      formBarcodes.includes(codeValue) || codeValue in variantsForDisplay;
    if (isDuplicate) {
      const message = t('duplicate-barcode');
      form.setError('barcodes', { type: 'manual', message });
      toast({
        title: message,
        variant: 'destructive',
      });
      return;
    }

    const newBarcodes = [...formBarcodes, codeValue];
    const newVariants = { ...variantsForDisplay, [codeValue]: {} };

    form.clearErrors('barcodes');
    setHasEditedVariants(true);
    syncBarcodesAndVariants(newBarcodes, newVariants);
    setCode('');
  };

  const handleRemoveBarcode = (index: number) => {
    const barcodeToRemove = barcodeItems[index];
    if (!barcodeToRemove) return;

    const newBarcodes = formBarcodes.filter((_, i) => i !== index);
    const newVariants = { ...variantsForDisplay };
    delete newVariants[barcodeToRemove.code];

    setHasEditedVariants(true);
    syncBarcodesAndVariants(newBarcodes, newVariants);
  };

  const handleUpdateBarcode = (
    index: number,
    field: 'name' | 'image',
    value: string | { url: string; name?: string } | undefined,
  ) => {
    const item = barcodeItems[index];
    if (!item) return;

    const newVariants = {
      ...variantsForDisplay,
      [item.code]: {
        ...variantsForDisplay[item.code],
        [field]: value,
      },
    };
    setHasEditedVariants(true);
    form.setValue('variants', newVariants);
  };

  const handleDescriptionChange = (content: string) => {
    form.setValue('barcodeDescription', content);
  };

  return (
    <>
      <ContactDetailSection title={t('barcodes')}>
        <div className="flex gap-2">
          <Input
            value={code}
            placeholder={t('enter-barcode', 'Enter a barcode')}
            aria-label={t('barcodes')}
            className="h-8 flex-1"
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddBarcode();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddBarcode}
            disabled={isAddDisabled}
          >
            <IconPlus />
            {t('add-barcode')}
          </Button>
        </div>
        {barcodeItems.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            {barcodeItems.map((barcode, index) => (
              <BarcodeRow
                key={barcode.code || index}
                barcode={barcode}
                index={index}
                availableImages={availableImages}
                t={t}
                onUpdate={handleUpdateBarcode}
                onRemove={handleRemoveBarcode}
              />
            ))}
          </div>
        )}
      </ContactDetailSection>
      <ContactDetailSection title={t('barcode-description')}>
        <Editor
          key={`${productDetail?._id ?? 'new'}-${resetKey}`}
          initialContent={formBarcodeDescription}
          onChange={handleDescriptionChange}
          className="h-auto min-h-20 rounded-sm shadow-none hover:bg-accent focus-within:bg-background focus-within:shadow-focus"
        />
      </ContactDetailSection>
    </>
  );
};
