import dayjs from 'dayjs';
import { splitType } from 'erxes-api-shared/core-modules';
import { isEnabled } from 'erxes-api-shared/utils';
import * as _ from 'lodash';
import { generateModels, IModels } from '~/connectionResolvers';
import { replaceContent } from '~/modules/documents/utils';
import { fieldsCombinedByContentType } from '~/modules/forms/utils';
import { buildProductReplacer } from '~/modules/products/meta/document/productReplacer';

const DOCUMENT_ATTRIBUTE_CONTENT_TYPES: Record<string, string> = {
  'core:contact.customer': 'core:contacts.customers',
  'core:contact.company': 'core:contacts.companies',
};

export const documents = {
  types: [
    {
      label: 'Customer',
      contentType: 'core:contact.customer',
    },
    {
      label: 'Company',
      contentType: 'core:contact.company',
    },
    {
      label: 'Product',
      contentType: 'core:product',
    },
    {
      label: 'Team member',
      contentType: 'core:user',
    },
    {
      label: 'Broadcast',
      contentType: 'core:broadcast',
    },
  ],
  editorAttributes: async (
    models: IModels,
    subdomain: string,
    contentType: string,
  ) => {
    const [pluginName, moduleName] = contentType.split(':');

    const isEnabledService = await isEnabled(pluginName);

    if (!isEnabledService) {
      return [];
    }

    const fields = await fieldsCombinedByContentType(models, subdomain, {
      contentType: DOCUMENT_ATTRIBUTE_CONTENT_TYPES[contentType] || contentType,
    });

    const fieldsList = fields.map(({ name, label, groupDetail }) => ({
      value: name,
      name: label,
      groupDetail,
    }));

    if (moduleName === 'product') {
      const productFields = fields
        .filter((field) => !['categoryId', 'code'].includes(field.name))
        .map((field) => ({
          value: field.name,
          name: field.label,
          type: field.type,
        }));

      return [
        { value: 'name', name: 'Name' },
        { value: 'shortName', name: 'Short name' },
        { value: 'code', name: 'Code' },
        { value: 'price', name: 'Price' },
        { value: 'bulkQuantity', name: 'Bulk quantity' },
        { value: 'bulkPrice', name: 'Bulk price' },
        { value: 'barcode', name: 'Barcode' },
        { value: 'barcodeText', name: 'Barcode Text' },
        { value: 'date', name: 'Date' },
        { value: 'barcodeDescription', name: 'Barcode description' },

        ...productFields,
      ];
    }

    return fieldsList;
  },
  replaceContent: async ({
    subdomain,
    data: { replacerIds, content, config, contentType },
  }) => {
    const { dateFormat = 'YYYY-MM-DD' } = config || {};

    const models = await generateModels(subdomain);

    const [, modulePath, collectionName] = splitType(contentType);
    const moduleName = collectionName || modulePath;

    const modelMap = {
      customer: models.Customers,
      user: models.Users,
      company: models.Companies,
      form: models.Forms,
      product: models.Products,
      broadcast: models.Customers,
      automation: models.Automations,
    };

    const model = modelMap[moduleName];

    if (!model) {
      return [content];
    }

    const documents = await model.find({ _id: { $in: replacerIds } });

    if (!documents.length) {
      return [content];
    }

    const replacedContents: any[] = [];

    for (const document of documents) {
      if (moduleName === 'product') {
        const { replacement, transform } = await buildProductReplacer({
          models,
          subdomain,
          product: document,
          config: config || {},
        });

        const replacedContent = await replaceContent({
          replacer: document,
          content,
          replacement,
          transform,
        });

        replacedContents.push(replacedContent);
        continue;
      }

      const replacedContent = await replaceContent({
        replacer: document,
        content,
        replacement: (replacer, path) => {
          const value =
            _.get(replacer, path) ??
            (['customer', 'company', 'broadcast'].includes(moduleName) &&
            typeof path === 'string' &&
            path.startsWith('details.')
              ? _.get(replacer, path.slice('details.'.length))
              : undefined);

          if (typeof value === 'number') {
            return value.toString();
          }

          if (value instanceof Date) {
            return dayjs(value).format(dateFormat);
          }

          return value?.toString() || '-';
        },
      });

      replacedContents.push(replacedContent);
    }

    return replacedContents;
  },
};
