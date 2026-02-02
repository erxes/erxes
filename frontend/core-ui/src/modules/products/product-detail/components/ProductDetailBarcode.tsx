import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Editor,
  InfoCard,
  Input,
  Label,
  Select,
  useToast,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useProductDetailWithQuery } from '../hooks/useProductDetailWithQuery';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';

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

export const ProductDetailBarcode = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const { toast } = useToast();
  const { productDetail } = useProductDetailWithQuery();

  const form = useFormContext<ProductFormValues>();
  const variants = (form.watch('variants') as VariantsMap) ?? {};

  const formBarcodes = normalizeBarcodes(form.watch('barcodes'));
  const formVariants = variants;
  const formBarcodeDescription = form.watch('barcodeDescription') ?? '';

  const variantsFromProduct: VariantsMap =
    (productDetail?.variants as VariantsMap) || {};

  const variantsForDisplay =
    Object.keys(formVariants).length > 0 ? formVariants : variantsFromProduct;

  const attachmentMore = Array.isArray(productDetail?.attachmentMore)
    ? productDetail.attachmentMore
    : [];

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
      const message = t('duplicate-barcode') || 'This barcode already exists.';
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
    syncBarcodesAndVariants(newBarcodes, newVariants);
    setCode('');
  };

  const handleRemoveBarcode = (index: number) => {
    const barcodeToRemove = barcodeItems[index];
    if (!barcodeToRemove) return;

    const newBarcodes = formBarcodes.filter((_, i) => i !== index);
    const newVariants = { ...variantsForDisplay };
    delete newVariants[barcodeToRemove.code];

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
    form.setValue('variants', newVariants);
  };

  const handleDescriptionChange = (content: string) => {
    form.setValue('barcodeDescription', content);
  };

  return (
    <InfoCard title={t('barcodes')}>
      <InfoCard.Content>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('barcodes')}</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBarcode}
              disabled={isAddDisabled}
              className="w-full"
            >
              <IconPlus className="mr-2 w-4 h-4" />
              {t('add-barcode') || 'Add barcode'}
            </Button>
            {barcodeItems.length > 0 ? (
              <div className="flex flex-col gap-2">
                {barcodeItems.map((barcode, index) => (
                  <div
                    key={barcode.code || index}
                    className="flex gap-2 items-end p-2 rounded-md border"
                  >
                    <div className="flex flex-col flex-1 gap-2">
                      <Label>CODE</Label>
                      <Input value={barcode.code || ''} disabled />
                    </div>
                    <div className="flex flex-col flex-1 gap-2">
                      <Label>NAME</Label>
                      <Input
                        value={barcode.name || ''}
                        onChange={(e) =>
                          handleUpdateBarcode(
                            index,
                            'name',
                            e.target.value || undefined,
                          )
                        }
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="flex flex-col flex-1 gap-2">
                      <Label>IMAGE</Label>
                      <Select
                        value={barcode.image?.url || ''}
                        onValueChange={(imageUrl) => {
                          const selectedImage = availableImages.find(
                            (img: { url: string; name?: string }) =>
                              img.url === imageUrl,
                          );
                          handleUpdateBarcode(
                            index,
                            'image',
                            selectedImage || undefined,
                          );
                        }}
                        disabled={availableImages.length === 0}
                      >
                        <Select.Trigger className="w-full max-w-[120px]">
                          <Select.Value
                            placeholder={
                              availableImages.length > 0
                                ? 'Select image'
                                : 'No image'
                            }
                          >
                            {barcode.image?.name}
                          </Select.Value>
                        </Select.Trigger>
                        <Select.Content>
                          {availableImages.map(
                            (img: { url: string; name?: string }) => (
                              <Select.Item key={img.url} value={img.url}>
                                {img.name || img.url}
                              </Select.Item>
                            ),
                          )}
                        </Select.Content>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mb-0 w-8 h-8 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemoveBarcode(index)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>{t('barcode-description')}</Label>
            <Editor
              initialContent={formBarcodeDescription}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
