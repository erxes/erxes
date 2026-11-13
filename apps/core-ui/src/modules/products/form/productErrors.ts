import { z } from 'zod';
import { errorData, isApiError } from '~/lib/api';
import type { ProductFormValues } from './productFormValues';

type Translate = (key: string, defaultValue: string) => string;

const existing = z.object({ productId: z.string() });

/** A save failure that belongs to one field; `productId` is the product that already has the code. */
export interface ProductFieldError {
  field: keyof ProductFormValues;
  message: string;
  productId?: string;
}

/** Where a failed save shows its message, or null for a toast. */
export const productFieldError = (error: unknown, t: Translate): ProductFieldError | null => {
  if (isApiError(error, 'PRODUCT_CODE_EXISTS')) {
    return {
      field: 'code',
      message: t('errors.code-exists', 'Another product has this code.'),
      productId: errorData(error, existing)?.productId,
    };
  }

  if (isApiError(error, 'PRODUCT_BARCODE_EXISTS')) {
    return {
      field: 'barcode',
      message: t('errors.barcode-exists', 'Another product has this barcode.'),
      productId: errorData(error, existing)?.productId,
    };
  }

  if (isApiError(error, 'INVALID_CATEGORY')) {
    return {
      field: 'categoryId',
      message: t('errors.invalid-category', 'This category no longer exists. Pick another.'),
    };
  }

  if (isApiError(error, 'PLUGIN_NOT_INSTALLED')) {
    return {
      field: 'plugins',
      message: t('errors.plugin-not-installed', 'A chosen plugin is not installed here.'),
    };
  }

  if (isApiError(error, 'INVALID_FILE')) {
    return {
      field: 'imageIds',
      message: t('errors.invalid-file', 'An image did not finish uploading. Add it again.'),
    };
  }

  return null;
};
