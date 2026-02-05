import { z } from 'zod';

export const ProductFormSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  code: z.string().min(1, { message: 'Product code is required' }),
  barcodes: z.array(z.string()).optional(),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  type: z.string().optional(),
  status: z.string().optional(),
  uom: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  barcodeDescription: z.string().optional(),
  vendorId: z.string().optional(),
  scopeBrandIds: z.array(z.string()).optional().catch([]),
  unitPrice: z.coerce.number().min(0, {
    message: 'Unit price must be greater than or equal to 0',
  }),
  attachment: z.any().optional(),
  attachmentMore: z.any().optional(),
  currency: z.string().optional(),
  subUoms: z.array(z.any()).optional(),
  variants: z.record(z.any()).optional().catch({}),
  customFieldsData: z.record(z.any()).optional().catch({}),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;

export const EMPTY_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: '',
  code: '',
  shortName: '',
  categoryId: '',
  type: '',
  status: '',
  uom: '',
  description: '',
  barcodeDescription: '',
  vendorId: '',
  scopeBrandIds: [],
  unitPrice: 0,
  barcodes: [],
  attachment: undefined,
  attachmentMore: undefined,
  currency: '',
  subUoms: [],
  variants: {},
  customFieldsData: {},
};
