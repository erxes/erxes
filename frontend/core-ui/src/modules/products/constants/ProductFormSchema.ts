import { z } from 'zod';
import { PRODUCT_DURATION_TYPES } from 'ui-modules/modules/products/constants/productTypes';

const PRODUCT_DURATION_TYPE_VALUES = PRODUCT_DURATION_TYPES.map(
  ({ value }) => value,
) as [
  (typeof PRODUCT_DURATION_TYPES)[number]['value'],
  ...(typeof PRODUCT_DURATION_TYPES)[number]['value'][],
];

export const ProductFormSchema = z
  .object({
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
    duration: z.preprocess(
      (value) => (value === '' || value == null ? undefined : Number(value)),
      z.number().positive('Duration must be greater than 0').optional(),
    ),
    durationType: z.enum(PRODUCT_DURATION_TYPE_VALUES).nullish(),
    attachment: z.any().optional(),
    attachmentMore: z.any().optional(),
    currency: z.string().optional(),
    subUoms: z.array(z.any()).optional(),
    variants: z.record(z.any()).optional().catch({}),
    customFieldsData: z.record(z.any()).optional().catch({}),
  })
  .superRefine((values, context) => {
    if (values.type === 'unique' && values.duration === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['duration'],
        message: 'Duration is required for unique products',
      });
    }

    if (values.type === 'unique' && values.durationType === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['durationType'],
        message: 'Duration type is required for unique products',
      });
    }
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
  duration: undefined,
  durationType: undefined,
  subUoms: [],
  variants: {},
  customFieldsData: {},
};
