import { useForm, UseFormReturn } from 'react-hook-form';
import {
  EMPTY_PRODUCT_FORM_VALUES,
  PRODUCT_FORM_SCHEMA,
} from '../constants/addProductFormSchema';
import { useAddProduct } from '../hooks/useProductsAdd';
import { zodResolver } from '@hookform/resolvers/zod';
import { IProductFormValues } from '../types';
import {
  Button,
  Collapsible,
  CurrencyCode,
  CurrencyField,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  Editor,
  Form,
  InfoCard,
  Input,
  Label,
  readImage,
  ScrollArea,
  Select,
  Sheet,
  toast,
  useErxesUpload,
  useRemoveFile,
  useQueryState,
} from 'erxes-ui';
import { SelectUOM } from './SelectUOM';
import { SubUomRow, type SubUomItem } from './SubUomRow';
import { SelectCategory } from '../categories';
import { SelectProductType } from './SelectProductType';
import {
  IconChevronDown,
  IconX,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectCompany } from 'ui-modules/modules/contacts';
import { MutationHookOptions } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { useFieldGroups, useFields } from 'ui-modules/modules/properties';
import { IFieldGroup } from 'ui-modules/modules/properties/types/fieldsTypes';
import { FieldLabel } from 'ui-modules/modules/properties/components/FieldLabel';
import { FieldString } from 'ui-modules/modules/properties/components/FieldString';
import { FieldNumber } from 'ui-modules/modules/properties/components/FieldNumber';
import { FieldBoolean } from 'ui-modules/modules/properties/components/FieldBoolean';
import { FieldDate } from 'ui-modules/modules/properties/components/FieldDate';
import { FieldSelect } from 'ui-modules/modules/properties/components/FieldSelect';
import { FieldRelation } from 'ui-modules/modules/properties/components/FieldRelation';
import { FieldFile } from 'ui-modules/modules/properties/components/FieldFile';
import { Spinner } from 'erxes-ui';

export function AddProductForm({
  embed,
  onOpenChange,
  showMoreInfo: controlledShowMoreInfo,
  onShowMoreInfoChange,
  options,
}: {
  embed?: boolean;
  onOpenChange: (open: boolean) => void;
  showMoreInfo?: boolean;
  onShowMoreInfoChange?: (showMoreInfo: boolean) => void;
  options?: MutationHookOptions<{ productsAdd: { _id: string } }>;
}) {
  const { productsAdd, loading } = useAddProduct();

  const form = useForm<IProductFormValues>({
    resolver: zodResolver(PRODUCT_FORM_SCHEMA),
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
  });

  async function onSubmit(data: IProductFormValues) {
    const cleanData: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value) && value.length === 0) return;

      if (key === 'barcodes' && Array.isArray(value)) {
        cleanData[key] = value.map((barcode: any) =>
          typeof barcode === 'object' && barcode?.code ? barcode.code : barcode,
        );
        return;
      }

      if (key === 'variants' && typeof value === 'object' && value !== null) {
        const variantsObj = value as Record<string, any>;
        const hasValidVariants = Object.keys(variantsObj).some(
          (code) => variantsObj[code]?.name || variantsObj[code]?.image,
        );
        if (hasValidVariants) {
          cleanData[key] = variantsObj;
        }
        return;
      }

      if (
        key === 'customFieldsData' &&
        typeof value === 'object' &&
        value !== null
      ) {
        const customFieldsArray = Object.entries(value)
          .filter(([_, val]) => val !== undefined && val !== null && val !== '')
          .map(([fieldId, val]) => ({
            field: fieldId,
            value: val,
          }));
        if (customFieldsArray.length > 0) {
          cleanData[key] = customFieldsArray;
        }
        return;
      }

      if (key === 'subUoms' && Array.isArray(value)) {
        cleanData[key] = value.map((subUom: SubUomItem) => {
          const { _id, ...rest } = subUom;
          return rest;
        });
        return;
      }

      cleanData[key] = value;
    });

    productsAdd({
      variables: cleanData,
      ...options,
      onError: (e) => {
        options?.onError?.(e);
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: (data) => {
        options?.onCompleted?.(data);
        toast({
          title: 'Success',
          description: 'Product created successfully',
          variant: 'success',
        });
        form.reset();
        const newShowMoreInfo = false;
        setShowMoreInfo(newShowMoreInfo);
        onShowMoreInfoChange?.(newShowMoreInfo);
        onOpenChange(false);
      },
    });
  }
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });

  const [internalShowMoreInfo, setInternalShowMoreInfo] = useState(false);
  const [selectedTab] = useQueryState<string>('tab');
  const showMoreInfo =
    controlledShowMoreInfo !== undefined
      ? controlledShowMoreInfo
      : internalShowMoreInfo;
  const setShowMoreInfo = (value: boolean) => {
    if (controlledShowMoreInfo === undefined) {
      setInternalShowMoreInfo(value);
    }
    onShowMoreInfoChange?.(value);
  };
  const isPropertiesTab = selectedTab === 'properties';

  const footerButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
      >
        {t('cancel')}
      </Button>
      <Button type="submit" variant="default" disabled={loading}>
        {loading ? t('creating') || 'Creating...' : t('create')}
      </Button>
    </>
  );

  if (embed) {
    if (isPropertiesTab) {
      return (
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            className="flex overflow-hidden flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1" viewportClassName="p-4">
              <AddProductFormCustomFields form={form} noTopPadding />
            </ScrollArea>
            <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2.5">
              {footerButtons}
            </div>
          </form>
        </Form>
      );
    }
    return (
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            form.handleSubmit(onSubmit)(e);
          }}
          className="flex overflow-hidden flex-col flex-1 min-h-0"
        >
          <ScrollArea className="flex-1" viewportClassName="p-4">
            <div>
              <AddProductFormFieldsDetail
                form={form}
                showExtended={showMoreInfo}
              />
              <Collapsible
                open={showMoreInfo}
                onOpenChange={setShowMoreInfo}
                className="flex flex-col items-center my-5"
              >
                <Collapsible.Content className="order-1 w-full">
                  <AddProductFormAttachmentsAndExtra form={form} />
                </Collapsible.Content>
                <Collapsible.Trigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    className="group"
                    size="sm"
                  >
                    {showMoreInfo ? t('see-less') : t('fill-in-more-info')}
                    <IconChevronDown
                      size={12}
                      strokeWidth={2}
                      className={`transition-transform ${
                        showMoreInfo ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </Collapsible.Trigger>
              </Collapsible>
            </div>
          </ScrollArea>
          <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2.5">
            {footerButtons}
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="flex overflow-hidden flex-col h-full"
      >
        <Sheet.Header className="gap-3 border-b">
          <Sheet.Title>{t('create-product')}</Sheet.Title> <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-4">
              <AddProductFormFieldsDetail
                form={form}
                showExtended={showMoreInfo}
              />
              <Collapsible
                open={showMoreInfo}
                onOpenChange={setShowMoreInfo}
                className="flex flex-col items-center my-5"
              >
                <Collapsible.Content className="order-1 w-full">
                  <AddProductFormAttachmentsAndExtra form={form} />
                  <AddProductFormCustomFields form={form} />
                </Collapsible.Content>
                <Collapsible.Trigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    className="group"
                    size="sm"
                  >
                    {showMoreInfo ? t('see-less') : t('fill-in-more-info')}
                    <IconChevronDown
                      size={12}
                      strokeWidth={2}
                      className={`transition-transform ${
                        showMoreInfo ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </Collapsible.Trigger>
              </Collapsible>
            </div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer className="flex shrink-0 justify-end gap-1 bg-background p-2.5">
          {footerButtons}
        </Sheet.Footer>
      </form>
    </Form>
  );
}

type BarcodeItem = {
  code: string;
  name?: string;
  image?: AttachmentItem;
};

function BarcodeManager({ form }: { form: UseFormReturn<IProductFormValues> }) {
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
                                (img) => img.url === imageUrl,
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
                              {availableImages.map((img) => (
                                <Select.Item key={img.url} value={img.url}>
                                  {img.name}
                                </Select.Item>
                              ))}
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

function SubUomManager({ form }: { form: UseFormReturn<IProductFormValues> }) {
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

function AddProductFormFieldsDetail({
  form,
  showExtended = false,
}: {
  form: UseFormReturn<IProductFormValues>;
  showExtended?: boolean;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  return (
    <div className={showExtended ? 'grid gap-4 lg:grid-cols-5' : ''}>
      <div className={showExtended ? 'grid gap-4 lg:col-span-3' : ''}>
        <InfoCard title={t('product-information')}>
          <InfoCard.Content>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('code')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="shortName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('short-name')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('type')}</Form.Label>
                    <SelectProductType
                      value={field.value}
                      onValueChange={field.onChange}
                      inForm
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('category')}</Form.Label>
                    <Form.Control>
                      <SelectCategory
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('unit-price')}</Form.Label>
                    <Form.Control>
                      <CurrencyField.ValueInput
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="uom"
                render={({ field }) => (
                  <Form.Item className="col-span-2">
                    <Form.Label>{t('unit-of-measure')}</Form.Label>
                    <SelectUOM
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      inForm
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item className="col-span-2">
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Editor
                        initialContent={field.value}
                        onChange={field.onChange}
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

      {showExtended && (
        <div className="grid gap-4 lg:col-span-2 lg:grid-cols-1">
          <InfoCard title={t('barcodes')}>
            <InfoCard.Content>
              <div className="flex flex-col gap-4 w-full">
                <BarcodeManager form={form} />

                <Form.Field
                  control={form.control}
                  name="barcodeDescription"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('barcode-description')}</Form.Label>
                      <Form.Control>
                        <Editor
                          initialContent={field.value}
                          onChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
            </InfoCard.Content>
          </InfoCard>

          <InfoCard title={t('unit-of-measure')}>
            <InfoCard.Content>
              <SubUomManager form={form} />
            </InfoCard.Content>
          </InfoCard>
        </div>
      )}
    </div>
  );
}

type AttachmentItem = {
  name: string;
  url: string;
  type: string;
  size: number;
};

function AddProductFeaturedImage({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const attachment = form.watch('attachment');

  const [file, setFile] = useState<AttachmentItem | null>(() => {
    const a =
      attachment && typeof attachment === 'object' && 'url' in attachment
        ? (attachment as AttachmentItem)
        : null;
    return a ?? null;
  });

  useEffect(() => {
    const a =
      attachment && typeof attachment === 'object' && 'url' in attachment
        ? (attachment as AttachmentItem)
        : null;
    setFile(a ?? null);
  }, [attachment]);

  const syncForm = useCallback(
    (next: AttachmentItem | null) => {
      form.setValue(
        'attachment',
        (next ?? '') as IProductFormValues['attachment'],
      );
    },
    [form],
  );

  const { removeFile, isLoading } = useRemoveFile();
  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      const first = added[0];
      if (first) {
        setFile(first);
        syncForm(first);
      }
    },
  });

  const handleRemove = useCallback(
    (item: AttachmentItem) => {
      removeFile(item.name, (status) => {
        if (status === 'ok') {
          setFile(null);
          syncForm(null);
        }
      });
    },
    [removeFile, syncForm],
  );

  return (
    <InfoCard title={t('primary-upload') || 'Primary Image'}>
      <InfoCard.Content>
        <div className="flex flex-wrap gap-4">
          {file && (
            <div className="overflow-hidden relative w-32 rounded-md aspect-square shadow-xs">
              <img
                src={readImage(file.url)}
                alt={file.name}
                className="object-contain w-full h-full"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                disabled={isLoading}
                onClick={() => handleRemove(file)}
              >
                <IconX size={12} />
              </Button>
            </div>
          )}
        </div>
        <Dropzone {...uploadProps}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
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

  const [files, setFiles] = useState<AttachmentItem[]>(() => {
    const more = Array.isArray(attachmentMore) ? attachmentMore : [];
    return more.filter(
      (x): x is AttachmentItem =>
        x != null && typeof x === 'object' && 'url' in x,
    );
  });

  useEffect(() => {
    const more = Array.isArray(attachmentMore) ? attachmentMore : [];
    setFiles(
      more.filter(
        (x): x is AttachmentItem =>
          x != null && typeof x === 'object' && 'url' in x,
      ),
    );
  }, [attachmentMore]);

  const syncForm = useCallback(
    (next: AttachmentItem[]) => {
      form.setValue(
        'attachmentMore',
        next as IProductFormValues['attachmentMore'],
      );
    },
    [form],
  );

  const { removeFile, isLoading } = useRemoveFile();
  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      setFiles((prev) => {
        const merged = [
          ...prev.filter((f) => !added.some((a) => a.name === f.name)),
          ...added,
        ];
        syncForm(merged);
        return merged;
      });
    },
  });

  const handleRemove = useCallback(
    (item: AttachmentItem) => {
      removeFile(item.name, (status) => {
        if (status === 'ok') {
          setFiles((prev) => {
            const next = prev.filter((f) => f.name !== item.name);
            syncForm(next);
            return next;
          });
        }
      });
    },
    [removeFile, syncForm],
  );

  return (
    <InfoCard title={t('secondary-upload') || 'Secondary Images'}>
      <InfoCard.Content>
        <div className="flex flex-wrap gap-4">
          {files.map((f) => (
            <div
              key={f.url}
              className="overflow-hidden relative w-32 rounded-md aspect-square shadow-xs"
            >
              <img
                src={readImage(f.url)}
                alt={f.name}
                className="object-contain w-full h-full"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                disabled={isLoading}
                onClick={() => handleRemove(f)}
              >
                <IconX size={12} />
              </Button>
            </div>
          ))}
        </div>
        <Dropzone {...uploadProps}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </InfoCard.Content>
    </InfoCard>
  );
}

function AddProductFormAttachmentsAndExtra({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  return (
    <>
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="col-span-1">
          <AddProductFeaturedImage form={form} />
        </div>
        <div className="col-span-2">
          <AddProductAttachmentMore form={form} />
        </div>
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

function AddProductFormCustomFields({
  form,
  noTopPadding,
}: {
  form: UseFormReturn<IProductFormValues>;
  noTopPadding?: boolean;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: 'core:product',
  });

  const customFieldsData = form.watch('customFieldsData') || {};

  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: unknown) => {
      const currentData = form.getValues('customFieldsData') || {};
      form.setValue('customFieldsData', {
        ...currentData,
        [fieldId]: value,
      });
    },
    [form],
  );

  if (fieldGroupsLoading) {
    return (
      <InfoCard title={t('product-properties') || 'Product Properties'}>
        <InfoCard.Content>
          <Spinner containerClassName="py-6" />
        </InfoCard.Content>
      </InfoCard>
    );
  }

  if (fieldGroups.length === 0) {
    return null;
  }

  return (
    <div className={noTopPadding ? undefined : 'pt-4'}>
      <InfoCard title={t('product-properties') || 'Product Properties'}>
        <InfoCard.Content>
          <div className="flex flex-col gap-4">
            {fieldGroups.map((group) => (
              <CustomFieldsGroup
                key={group._id}
                group={group}
                customFieldsData={customFieldsData}
                onFieldChange={updateCustomFieldValue}
              />
            ))}
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
}

function CustomFieldsGroup({
  group,
  customFieldsData,
  onFieldChange,
}: {
  group: IFieldGroup;
  customFieldsData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: 'core:product',
  });

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <Collapsible key={group._id} className="group" defaultOpen>
      <Collapsible.Trigger asChild>
        <Button variant="secondary" className="justify-start w-full">
          <Collapsible.TriggerIcon />
          {group.name}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <CustomField
              key={field._id}
              field={field}
              value={customFieldsData[field._id]}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}

function CustomField({
  field,
  value,
  onFieldChange,
}: {
  field: any;
  value: unknown;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  const handleChange = useCallback(
    (newValue: unknown) => {
      onFieldChange(field._id, newValue);
    },
    [field._id, onFieldChange],
  );

  const fieldProps = {
    field,
    value: value ?? '',
    handleChange,
    loading: false,
    id: `product_form_${field._id}`,
    customFieldsData: {},
  };

  return (
    <FieldLabel field={field} id={fieldProps.id}>
      {(() => {
        switch (field.type) {
          case 'text':
            return <FieldString {...fieldProps} />;
          case 'number':
            return <FieldNumber {...fieldProps} />;
          case 'boolean':
            return <FieldBoolean {...fieldProps} />;
          case 'date':
            return <FieldDate {...fieldProps} />;
          case 'select':
            return <FieldSelect {...fieldProps} />;
          case 'relation':
            return <FieldRelation {...fieldProps} />;
          case 'file':
            return <FieldFile {...fieldProps} />;
          default:
            return null;
        }
      })()}
    </FieldLabel>
  );
}
