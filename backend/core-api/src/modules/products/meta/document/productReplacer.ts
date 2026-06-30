import { dateToShortStr, getEnv } from 'erxes-api-shared/utils';
import dayjs from 'dayjs';
import { IModels } from '~/connectionResolvers';
import { generateBarcodeSvg } from '~/modules/documents/barcode';
import { blocksToHtml } from '~/modules/documents/blocksToHtml';

const readFileUrl = (key: string) => {
  const DOMAIN = getEnv({
    name: 'DOMAIN',
    defaultValue: 'http://localhost:4000',
  });

  if (DOMAIN.includes('localhost')) {
    return `http://localhost:4000/read-file?key=${encodeURIComponent(key)}`;
  }

  return `${DOMAIN}/gateway/read-file?key=${encodeURIComponent(key)}`;
};

const toMoney = (value?: number) => {
  if (!value) {
    return '-';
  }

  return new Intl.NumberFormat().format(value);
};

const isBlocksJson = (value?: string) => {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith('[')) {
    return false;
  }

  try {
    return Array.isArray(JSON.parse(trimmed));
  } catch {
    return false;
  }
};

export const buildProductReplacer = async ({
  models,
  product,
  config,
}: {
  models: IModels;
  product: any;
  config: Record<string, any>;
}) => {
  const { isDate, date, productDateFormat = 'YYYY-MM-DD HH:mm' } = config || {};

  const baseBarcode = (product.barcodes || [])[0] || '';
  const shortStr =
    baseBarcode && ['1', 'true', 'True', true].includes(isDate)
      ? `_${dateToShortStr(date, 92, 'h')}`
      : '';
  const barcodeValue = baseBarcode ? `${baseBarcode}${shortStr}` : '';

  let vendorName = '';

  if (product.vendorId) {
    const vendor = await models.Companies.findOne({ _id: product.vendorId });
    vendorName = vendor?.primaryName || '';
  }

  const customFields: Record<string, string> = {};
  for (const cfd of product.customFieldsData || []) {
    customFields[`customFieldsData.${cfd.field}`] = cfd.value;
  }

  const values: Record<string, string> = {
    name: product.name || '-',
    shortName: product.shortName || '-',
    code: product.code || '-',
    price: toMoney(product.unitPrice),
    bulkQuantity: '-',
    bulkPrice: '-',
    barcode: barcodeValue,
    barcodeText: barcodeValue,
    barcodeDescription: product.barcodeDescription || '',
    date: dayjs(date || new Date()).format(productDateFormat),
    vendorId: vendorName,
    ...customFields,
  };

  const replacement = (_replacer: any, path: string) => {
    if (path in values) {
      return values[path];
    }

    const value = product[path];

    if (value === undefined || value === null) {
      return '-';
    }

    return value.toString();
  };

  const transform = (block: any) => {
    const { props } = block;
    const path = props?.value;

    if (path === 'barcode') {
      if (!barcodeValue) {
        return { ...block, type: 'rawHtml', props: { ...props, html: '' } };
      }

      const svg = generateBarcodeSvg(barcodeValue);

      return {
        ...block,
        type: 'rawHtml',
        props: {
          ...props,
          html: `<span style="display: inline-block;">${svg}</span>`,
        },
      };
    }

    if (
      path === 'barcodeDescription' &&
      isBlocksJson(product.barcodeDescription)
    ) {
      const descriptionHtml = blocksToHtml(product.barcodeDescription, {
        resolveImageUrl: (url: string) => readFileUrl(url),
      });

      const inlineHtml = descriptionHtml
        .replace(/<(p|div)[^>]*>(\s|&nbsp;)*<\/(p|div)>/gi, '')
        .replace(/<\/(p|div)>/gi, '<br />')
        .replace(/<(p|div)([^>]*)>/gi, '<span$2>')
        .replace(/display:\s*block/gi, 'display: inline-block')
        .replace(/margin:\s*16px 0/gi, 'margin: 0')
        .replace(/(<br\s*\/?>\s*)+/gi, '<br />')
        .replace(/^(\s|<br\s*\/?>)+|(\s|<br\s*\/?>)+$/gi, '');

      return {
        ...block,
        type: 'rawHtml',
        props: {
          ...props,
          html: `<span style="display: inline-block;">${inlineHtml}</span>`,
        },
      };
    }

    return null;
  };

  return { replacement, transform };
};
