import * as z from 'zod';
import { PRODUCT_DURATION_TYPE_VALUES } from './productTypes';

export const PRODUCT_FORM_SCHEMA = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    shortName: z.string().max(50, 'Short name must be less than 50 characters'),
    type: z.string().min(1, 'Please select a type'),
    categoryId: z
      .string({
        required_error: 'Please select a category',
      })
      .min(1, 'Please select a category'),
    description: z.string().optional(),
    barcodes: z.array(z.string()).optional(),
    variants: z.any().optional(),
    barcodeDescription: z.string().optional(),
    unitPrice: z.number({
      required_error: 'Unit price is required',
    }),
    duration: z.preprocess(
      (value) => (value === '' || value == null ? undefined : Number(value)),
      z.number().positive('Duration must be greater than 0').optional(),
    ),
    durationType: z.enum(PRODUCT_DURATION_TYPE_VALUES).optional(),
    code: z
      .string()
      .min(2, 'Code must be at least 2 characters')
      .max(50, 'Code must be less than 50 characters'),
    customFieldsData: z.any().optional(),
    attachment: z.any().optional(),
    attachmentMore: z.any().optional(),
    // pdfAttachment: z
    //   .object({
    //     name: z.string().optional(),
    //     url: z.string().optional(),
    //     type: z.string().optional(),
    //     size: z.number().optional(),
    //   })
    //   .optional(),
    vendorId: z.string().optional(),
    scopeBrandIds: z.array(z.string()).optional(),
    uom: z
      .string({
        required_error: 'Please select a unit of measurement',
      })
      .min(1, 'Please select a unit of measurement'),
    subUoms: z.any().optional(),
    currency: z.string().optional(),
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

export type ProductFormSchemaType = z.infer<typeof PRODUCT_FORM_SCHEMA>;

export const EMPTY_PRODUCT_FORM_VALUES: ProductFormSchemaType = {
  name: '',
  code: '',
  categoryId: '',
  vendorId: '',
  type: 'product',
  uom: '',
  shortName: '',
  attachment: undefined,
  attachmentMore: undefined,
  description: '',
  subUoms: [],
  barcodes: [],
  variants: {},
  barcodeDescription: '',
  scopeBrandIds: [],
  unitPrice: 0,
  duration: undefined,
  durationType: undefined,
  currency: '',
  customFieldsData: {},
};
