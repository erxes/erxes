import dayjs from 'dayjs';
import { isEnabled } from 'erxes-api-shared/utils';
import * as _ from 'lodash';
import { generateModels, IModels } from '~/connectionResolvers';
import { replaceContent } from '~/modules/documents/utils';
import { fieldsCombinedByContentType } from '~/modules/forms/utils';

export const documents = {
  types: [
    {
      label: 'Customer',
      contentType: 'core:customer',
    },
    {
      label: 'Company',
      contentType: 'core:company',
    },
    {
      label: 'Product',
      contentType: 'core:product',
    },
    {
      label: 'Team member',
      contentType: 'core:user',
    },
  ],
  editorAttributes: async (
    models: IModels,
    subdomain: string,
    contentType: string,
  ) => {
    const [pluginName, moduleName] = contentType.split(':');

    const isEnabledService = isEnabled(pluginName);

    if (!isEnabledService) {
      return [];
    }

    const fields = await fieldsCombinedByContentType(models, subdomain, {
      contentType,
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

    const [_pluginName, moduleName] = contentType.split(':');

    const modelMap = {
      customer: models.Customers,
      user: models.Users,
      company: models.Companies,
      form: models.Forms,
      product: models.Products,
      automation: models.Automations,
    };

    const model = modelMap[moduleName];

    if (!model) {
      throw new Error(`Unknown content type: ${moduleName}`);
    }

    const documents = await model.find({ _id: { $in: replacerIds } });

    const replacedContents: any[] = [];

    for (const document of documents) {
      const replacedContent = await replaceContent({
        replacer: document,
        content,
        replacement: (replacer, path) => {
          const value = _.get(replacer, path);

          if (typeof value === 'number') {
            return value.toString();
          }

          if (value instanceof Date) {
            return dayjs(value).format(dateFormat);
          }

          // console.log('value', value);

          return value?.toString() || '-';
        },
      });

      replacedContents.push(replacedContent);
    }

    return replacedContents;
  },
};
