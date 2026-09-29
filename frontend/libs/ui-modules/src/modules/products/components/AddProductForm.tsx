import { MutationHookOptions } from '@apollo/client';
import { IconChevronDown } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  Form,
  ScrollArea,
  Sheet,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAddProduct } from '../hooks/useProductsAdd';
import { IProductFormValues } from '../types';
import { AddProductFormAttachmentsAndExtra } from './ProductAttachments';
import { AddProductFormCustomFields } from './ProductCustomFields';
import { AddProductFormFieldsDetail } from './ProductFieldsDetail';
import type { SubUomItem } from './SubUomRow';

export function AddProductForm({
  embed,
  onOpenChange,
  showMoreInfo: controlledShowMoreInfo,
  onShowMoreInfoChange,
  options,
  form,
}: Readonly<{
  embed?: boolean;
  onOpenChange: (open: boolean) => void;
  showMoreInfo?: boolean;
  onShowMoreInfoChange?: (showMoreInfo: boolean) => void;
  options?: MutationHookOptions<{ productsAdd: { _id: string } }>;
  form: UseFormReturn<IProductFormValues>;
}>) {
  const { productsAdd, loading } = useAddProduct();

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
        const customFieldsObj = Object.entries(value)
          .filter((entry) => {
            const val = entry[1];
            return val !== undefined && val !== null && val !== '';
          })
          .reduce((acc, [fieldId, val]) => {
            acc[fieldId] = val;
            return acc;
          }, {} as Record<string, unknown>);
        if (Object.keys(customFieldsObj).length > 0) {
          cleanData['propertiesData'] = customFieldsObj;
        }
        return;
      }

      if (key === 'uom') {
        cleanData[key] = value;
        return;
      }

      if (key === 'subUoms' && Array.isArray(value)) {
        cleanData[key] = value.map((subUom: SubUomItem) => {
          const rest = { ...subUom };
          delete rest._id;
          return rest;
        });
        return;
      }

      cleanData[key] = value;
    });

    await productsAdd({
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
