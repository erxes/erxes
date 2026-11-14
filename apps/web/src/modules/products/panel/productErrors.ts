import { isApiError } from '~/lib/api';

type Translate = (key: string, defaultValue: string) => string;

/** A save failure about one field; `productId` is the product that already has the code. */
interface ProductFieldError {
  field: 'code' | 'barcode' | 'categoryId' | 'plugins' | 'imageIds';
  message: string;
  productId?: string;
}

/** What a failed save was about, or null when it was not about one field. */
export const productFieldError = (error: unknown, t: Translate): ProductFieldError | null => {
  if (isApiError(error, 'TAKEN') && error.data.field === 'code') {
    return {
      field: 'code',
      message: t('errors.code-exists', 'Another product has this code.'),
      productId: error.data.id,
    };
  }

  if (isApiError(error, 'TAKEN') && error.data.field === 'barcode') {
    return {
      field: 'barcode',
      message: t('errors.barcode-exists', 'Another product has this barcode.'),
      productId: error.data.id,
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
