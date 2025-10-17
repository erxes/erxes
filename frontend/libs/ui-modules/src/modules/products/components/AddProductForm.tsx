import { useForm, UseFormReturn } from 'react-hook-form';
import { PRODUCT_FORM_SCHEMA } from '../constants/addProductFormSchema';
import { useAddProduct } from '../hooks/useProductsAdd';
import { zodResolver } from '@hookform/resolvers/zod';
import { IProductFormValues } from '../types';
import {
  Button,
  Collapsible,
  CurrencyField,
  Editor,
  Form,
  Input,
  ScrollArea,
  Sheet,
  toast,
  Upload,
} from 'erxes-ui';
import { SelectUOM } from './SelectUOM';
import { SelectCategory } from '../categories';
import { SelectProductType } from './SelectProductType';
import { IconChevronDown, IconUpload } from '@tabler/icons-react';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectCompany } from 'ui-modules/modules/contacts';
import { MutationHookOptions } from '@apollo/client';

export function AddProductForm({
  onOpenChange,
  options,
}: {
  onOpenChange: (open: boolean) => void;
  options?: MutationHookOptions<{ productsAdd: { _id: string } }>;
}) {
  const { productsAdd } = useAddProduct();

  const form = useForm<IProductFormValues>({
    resolver: zodResolver(PRODUCT_FORM_SCHEMA),
    defaultValues: {
      name: '',
      code: '',
      categoryId: '',
      vendorId: '',
      type: 'product',
      uom: '',
      shortName: '',
      attachment: '',
      attachmentMore: '',
      description: '',
      pdfAttachment: {},
      subUoms: [],
      barcodes: [],
      variants: {},
      barcodeDescription: '',
      scopeBrandIds: [],
    },
  });

  async function onSubmit(data: IProductFormValues) {
    const cleanData: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        cleanData[key] = value;
      }
    });

    productsAdd({
      variables: cleanData,
      ...options,
      onError: (e) => {
        options?.onError?.(e);
        toast({
          title: 'Error',
          description: e.message,
        });
      },
      onCompleted: (data) => {
        options?.onCompleted?.(data);
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col h-full overflow-hidden"
      >
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>Create product</Sheet.Title> <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-auto overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5">
              <ProductAddCoreFields form={form} />
              <Collapsible className="flex flex-col items-center my-5">
                <Collapsible.Content className="order-1 w-full">
                  <ProductAddMoreFields form={form} />
                </Collapsible.Content>
                <Collapsible.Trigger asChild>
                  <Button variant="secondary" className="group" size="sm">
                    <span className="group-data-[state=open]:hidden">
                      Fill in more info
                    </span>
                    <span className="group-data-[state=closed]:hidden">
                      See less
                    </span>
                    <IconChevronDown
                      size={12}
                      strokeWidth={2}
                      className="group-data-[state=open]:rotate-180"
                    />
                  </Button>
                </Collapsible.Trigger>
              </Collapsible>
            </div>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end flex-shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}

const ProductAddCoreFields = ({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) => {
  return (
    <div className="grid grid-cols-2 gap-5 ">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>NAME</Form.Label>
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
            <Form.Label>CODE</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="uom"
        render={({ field }) => (
          <Form.Item className="flex flex-col">
            <Form.Label>UNIT OF MEASUREMENTS</Form.Label>
            <SelectUOM
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
        name="unitPrice"
        render={({ field }) => (
          <Form.Item className="flex flex-col">
            <Form.Label>UNIT PRICE</Form.Label>
            <Form.Control>
              <CurrencyField.ValueInput
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            </Form.Control>

            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>CATEGORY</Form.Label>
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
        name="shortName"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>SHORT NAME</Form.Label>
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
            <Form.Label>TYPE</Form.Label>
            <SelectProductType
              value={field.value}
              onValueChange={field.onChange}
              inForm
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};

const ProductAddMoreFields = ({
  form,
}: {
  form: UseFormReturn<IProductFormValues>;
}) => {
  return (
    <>
      <div className="flex items-center my-4">
        <div className="flex-1 border-t" />
        <Form.Label className="mx-2">More Info</Form.Label>
        <div className="flex-1 border-t" />
      </div>
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>DESCRIPTION</Form.Label>
            <Form.Control>
              <Editor initialContent={field.value} onChange={field.onChange} />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="barcodes"
        render={({ field }) => (
          <Form.Item className="flex flex-col mb-5">
            <Form.Label>BARCODES</Form.Label>
            <div className="flex flex-col">
              <Form.Control>
                <Input
                  className="h-8 rounded-md"
                  {...field}
                  onChange={(e) => field.onChange([e.target.value])}
                />
              </Form.Control>
              <Form.Message className="text-destructive" />
            </div>
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="barcodeDescription"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>BARCODE DESCRIPTION</Form.Label>
            <Form.Control>
              <Editor initialContent={field.value} onChange={field.onChange} />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Form.Field
          control={form.control}
          name="scopeBrandIds"
          render={({ field }) => (
            <Form.Item className="flex flex-col">
              <Form.Label>BRAND</Form.Label>
              <Form.Control>
                <SelectBrand
                  value={field.value || []}
                  onValueChange={field.onChange}
                  mode="multiple"
                />
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <Form.Item className="flex flex-col">
              <Form.Label>VENDOR</Form.Label>
              <Form.Control>
                <SelectCompany
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        control={form.control}
        name="attachment"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>UPLOAD</Form.Label>
            <Form.Control>
              <Upload.Root {...field}>
                <Upload.Preview className="hidden" />
                <Upload.Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  className="flex flex-col items-center justify-center w-full h-20 border border-dashed text-muted-foreground"
                >
                  <IconUpload />
                  <span className="text-sm font-medium">Primary upload</span>
                </Upload.Button>
              </Upload.Root>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="attachmentMore"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>SECONDARY UPLOAD</Form.Label>
            <Form.Control>
              <Upload.Root {...field}>
                <Upload.Preview className="hidden" />
                <Upload.Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  className="flex flex-col items-center justify-center w-full h-20 border border-dashed text-muted-foreground"
                >
                  <IconUpload />
                  <span className="text-sm font-medium">Secondary upload</span>
                </Upload.Button>
              </Upload.Root>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
    </>
  );
};
