import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Editor, InfoCard, Input, Label, Select } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductDetailWithQuery } from '../hooks/useProductDetailWithQuery';
import { useProductsEdit } from '@/products/hooks/useProductsEdit';

interface ProductDetailBarcodeProps {
  barcodes?: string[] | string;
  barcodeDescription?: string;
}

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

export const ProductDetailBarcode = ({
  barcodes: initialBarcodes,
  barcodeDescription: initialBarcodeDescription,
}: ProductDetailBarcodeProps) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });

  const { productDetail } = useProductDetailWithQuery();
  const { productsEdit } = useProductsEdit();

  const normalizedBarcodes = normalizeBarcodes(initialBarcodes);
  const variants =
    (productDetail?.variants as Record<
      string,
      { name?: string; image?: { url: string; name?: string } }
    >) || {};

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
  const [description, setDescription] = useState<string>(
    initialBarcodeDescription || '',
  );
  const [barcodes, setBarcodes] = useState<string[]>(normalizedBarcodes);

  const barcodeItems: BarcodeItem[] = useMemo(() => {
    return barcodes.map((codeValue) => {
      const variant = variants[codeValue];
      return {
        code: codeValue,
        name: variant?.name,
        image: variant?.image,
      };
    });
  }, [barcodes, variants]);

  const isAddDisabled = !code.trim();

  const syncBarcodesAndVariants = async (
    newBarcodes: string[],
    newVariants: Record<
      string,
      { name?: string; image?: { url: string; name?: string } }
    >,
  ) => {
    setBarcodes(newBarcodes);

    if (productDetail?._id) {
      await productsEdit({
        variables: {
          _id: productDetail._id,
          barcodes: newBarcodes,
          variants: newVariants,
        },
      });
    }
  };

  const handleAddBarcode = async () => {
    if (!code.trim()) return;

    const codeValue = code.trim();
    const newBarcodes = [...barcodes, codeValue];
    const newVariants = {
      ...variants,
      [codeValue]: {},
    };

    await syncBarcodesAndVariants(newBarcodes, newVariants);
    setCode('');
  };

  const handleRemoveBarcode = async (index: number) => {
    const barcodeToRemove = barcodeItems[index];
    if (!barcodeToRemove) return;

    const newBarcodes = barcodes.filter((_, i) => i !== index);
    const newVariants = { ...variants };
    delete newVariants[barcodeToRemove.code];

    await syncBarcodesAndVariants(newBarcodes, newVariants);
  };

  const handleUpdateBarcode = async (
    index: number,
    fieldName: keyof BarcodeItem,
    value: string | { url: string; name?: string } | undefined,
  ) => {
    const barcodeItem = barcodeItems[index];
    if (!barcodeItem) return;

    const codeValue = barcodeItem.code;
    const currentVariant = variants[codeValue] || {};
    const newVariants = {
      ...variants,
      [codeValue]: {
        ...currentVariant,
        [fieldName]: value,
      },
    };

    if (productDetail?._id) {
      await productsEdit({
        variables: {
          _id: productDetail._id,
          variants: newVariants,
        },
      });
    }
  };

  const handleDescriptionChange = async (content: string) => {
    setDescription(content);

    if (productDetail?._id) {
      await productsEdit({
        variables: {
          _id: productDetail._id,
          barcodeDescription: content,
        },
      });
    }
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
              initialContent={description}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
