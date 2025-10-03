import * as z from 'zod';

export const productFormSchema = z.object({
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
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code must be less than 50 characters'),
  customFieldsData: z.any().optional(),
  attachment: z.any().optional(),
  attachmentMore: z.any().optional(),
  pdfAttachment: z
    .object({
      name: z.string().optional(),
      url: z.string().optional(),
      type: z.string().optional(),
      size: z.number().optional(),
    })
    .optional(),
  vendorId: z.string().optional(),
  scopeBrandIds: z.array(z.string()).optional(),
  uom: z
    .string({
      required_error: 'UOM is required',
    })
    .min(1, 'UOM is required'),
  subUoms: z.any().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
