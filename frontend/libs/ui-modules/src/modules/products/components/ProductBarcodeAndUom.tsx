import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  Label,
  Select,
  TextOverflowTooltip,
} from 'erxes-ui';
import { nanoid } from 'nanoid';
import { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IProductFormValues } from '../types';
import { type ProductAttachmentItem } from './ProductImageUploads';
import { SubUomRow, type SubUomItem } from './SubUomRow';

type AttachmentItem = ProductAttachmentItem;

type BarcodeItem = {
  code: string;
  name?: string;
  image?: AttachmentItem;
};

function BarcodeRow({
  barcode,
  index,
  availableImages,
  onUpdate,
  onRemove,
}: Readonly<{
  barcode: BarcodeItem;
  index: number;
  availableImages: AttachmentItem[];
  onUpdate: (
    index: number,
    fieldName: keyof BarcodeItem,
    value: string | AttachmentItem | undefined,
  ) => void;
  onRemove: (index: number) => void;
}>) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-md border">
      <div className="flex gap-2 items-end">
        <div className="flex flex-col flex-1 gap-2 min-w-0">
          <Label>CODE</Label>
          <div className="flex overflow-hidden items-center px-3 w-full h-8 text-sm rounded-sm border cursor-not-allowed bg-background opacity-50 shadow-xs">
            <TextOverflowTooltip value={barcode.code} className="min-w-0" />
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-2 min-w-0">
          <Label>NAME</Label>
          <TextOverflowTooltip.Input
            value={barcode.name || ''}
            onChange={(value) => onUpdate(index, 'name', value || undefined)}
            placeholder="Enter name"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove barcode ${barcode.code}`}
          className="mb-0 w-8 h-8 text-destructive hover:text-destructive shrink-0"
          onClick={() => onRemove(index)}
        >
          <IconTrash size={16} />
        </Button>
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex flex-col flex-1 gap-2 min-w-0">
          <Label>IMAGE</Label>
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
            <Select.Trigger className="w-full">
              <Select.Value
                placeholder={
                  availableImages.length > 0 ? 'Select image' : 'No image'
                }
              >
                {barcode.image?.name}
              </Select.Value>
            </Select.Trigger>
            <Select.Content>
              {availableImages.map((img) => (
                <Select.Item key={img.url} value={img.url}>
                  {img.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="w-8 shrink-0" />
      </div>
    </div>
  );
}

export function BarcodeManager({
  form,
}: Readonly<{
  form: UseFormReturn<IProductFormValues>;
}>) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });

  const [code, setCode] = useState('');

  const attachmentMore = form.watch('attachmentMore');
  const availableImages = useMemo(() => {
    return Array.isArray(attachmentMore)
      ? attachmentMore.filter(
          (x): x is AttachmentItem =>
            x != null && typeof x === 'object' && 'url' in x,
        )
      : [];
  }, [attachmentMore]);

  return (
    <Form.Field
      control={form.control}
      name="barcodes"
      render={({ field }) => {
        const barcodesRaw = Array.isArray(field.value) ? field.value : [];
        const barcodes: string[] = barcodesRaw.map(
          (code: string | BarcodeItem) =>
            typeof code === 'string' ? code : code?.code || '',
        );
        const variants = form.watch('variants') || {};

        const barcodeItems: BarcodeItem[] = barcodes.map((codeValue) => {
          const variant = variants[codeValue];
          return {
            code: codeValue,
            name: variant?.name,
            image: variant?.image,
          };
        });

        const normalizedCode = code.trim();
        const isDuplicate = normalizedCode && barcodes.includes(normalizedCode);
        const isAddDisabled = !normalizedCode || isDuplicate;

        const syncBarcodesAndVariants = (
          newBarcodes: string[],
          newVariants: Record<
            string,
            { name?: string; image?: AttachmentItem }
          >,
        ) => {
          field.onChange(newBarcodes);
          form.setValue('variants', newVariants);
        };

        const handleAddBarcode = () => {
          if (!normalizedCode) return;

          if (barcodes.includes(normalizedCode)) return;

          const codeValue = normalizedCode;
          const newBarcodes = [...barcodes, codeValue];
          const newVariants = {
            ...variants,
            [codeValue]: {},
          };

          syncBarcodesAndVariants(newBarcodes, newVariants);
          setCode('');
        };

        const handleRemoveBarcode = (index: number) => {
          const barcodeToRemove = barcodeItems[index];
          if (!barcodeToRemove) return;

          const newBarcodes = barcodes.filter((_, i) => i !== index);
          const newVariants = { ...variants };
          delete newVariants[barcodeToRemove.code];

          syncBarcodesAndVariants(newBarcodes, newVariants);
        };

        const handleUpdateBarcode = (
          index: number,
          fieldName: keyof BarcodeItem,
          value: string | AttachmentItem | undefined,
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

          form.setValue('variants', newVariants);
        };

        return (
          <Form.Item>
            <Form.Label>{t('barcodes')}</Form.Label>
            <Form.Control>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBarcode();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBarcode}
                  disabled={Boolean(isAddDisabled)}
                  className="w-full"
                >
                  <IconPlus className="mr-2 w-4 h-4" />
                  {t('add-barcode') || 'Add barcode'}
                </Button>
                {barcodeItems.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {barcodeItems.map((barcode, index) => (
                      <BarcodeRow
                        key={barcode.code || index}
                        barcode={barcode}
                        index={index}
                        availableImages={availableImages}
                        onUpdate={handleUpdateBarcode}
                        onRemove={handleRemoveBarcode}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
}

export function SubUomManager({
  form,
}: Readonly<{
  form: UseFormReturn<IProductFormValues>;
}>) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });

  return (
    <Form.Field
      control={form.control}
      name="subUoms"
      render={({ field }) => {
        const subUoms = Array.isArray(field.value) ? field.value : [];

        const handleAddSubUom = () => {
          const newSubUom: SubUomItem = {
            _id: nanoid(),
            uom: '',
            ratio: 1,
          };
          field.onChange([...subUoms, newSubUom]);
        };

        const handleRemoveSubUom = (index: number) => {
          const updated = subUoms.filter((_, i) => i !== index);
          field.onChange(updated);
        };

        const handleUpdateSubUom = (
          index: number,
          fieldName: keyof SubUomItem,
          value: string | number,
        ) => {
          const updated: SubUomItem[] = subUoms.map((subUom, i) => {
            if (i === index) {
              const updatedItem = { ...subUom, [fieldName]: value };
              return updatedItem;
            }
            return subUom;
          });
          field.onChange(updated);
        };

        return (
          <Form.Item>
            <Form.Control>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubUom}
                    className="w-full"
                  >
                    <IconPlus className="mr-2 w-4 h-4" />
                    {t('add-sub') || 'Add sub'}
                  </Button>
                </div>
                {subUoms.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {subUoms.map((subUom, index) => (
                      <SubUomRow
                        key={subUom._id || index}
                        subUom={subUom}
                        index={index}
                        onUpdate={handleUpdateSubUom}
                        onRemove={handleRemoveSubUom}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
}
