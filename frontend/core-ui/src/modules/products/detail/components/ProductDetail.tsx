import {
  ProductDetailLayout,
  ProductDetailTabContent,
} from './ProductDetailLayout';
import { Separator, Form } from 'erxes-ui';
import { ProductProperties } from './ProductProperties';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductDetailForm } from './ProductGeneral';
import {
  ProductFormSchema,
  ProductFormValues,
} from '@/products/constants/ProductFormSchema';

export const ProductDetail = () => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: '',
      code: '',
      barcodes: [''],
      categoryId: '',
      type: '',
      status: '',
      uom: '',
      shortName: '',
      description: '',
      barcodeDescription: '',
      vendorId: '',
      scopeBrandIds: [],
      unitPrice: 0,
    },
  });

  return (
    <Form {...form}>
      <form>
        <ProductDetailLayout form={form}>
          <Separator />
          <ProductDetailTabContent value="overview">
            <ProductDetailForm form={form} />
          </ProductDetailTabContent>
          <ProductDetailTabContent value="properties">
            <ProductProperties />
          </ProductDetailTabContent>
        </ProductDetailLayout>
      </form>
    </Form>
  );
};
