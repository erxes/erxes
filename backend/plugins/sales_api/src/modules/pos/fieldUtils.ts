import { generateFieldsFromSchema } from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';
import { IModels } from '~/connectionResolvers';

type TSelectionConfig = {
  labelField: string;
  queryName: string;
};

export type TPosOrderField = {
  _id: string | number;
  name: string;
  group?: string;
  label?: string;
  type?: string;
  validation?: string;
  options?: string[];
  selectOptions?: Array<{ label: string; value: string }>;
  selectionConfig?: TSelectionConfig;
};

export const POS_ORDER_EXTENDED_FIELDS: TPosOrderField[] = [
  {
    _id: 'items.productCategoryCode',
    name: 'items.productCategoryCode',
    label: 'Product category code',
    type: 'String',
  },
  {
    _id: 'items.productCategoryName',
    name: 'items.productCategoryName',
    label: 'Product category name',
    type: 'String',
  },
  {
    _id: 'items.amount',
    name: 'items.amount',
    label: 'Amount',
    type: 'Number',
  },
  {
    _id: 'items.productCode',
    name: 'items.productCode',
    label: 'Product code',
    type: 'String',
  },
  {
    _id: 'items.productName',
    name: 'items.productName',
    label: 'Product name',
    type: 'String',
  },
  {
    _id: 'items.barcode',
    name: 'items.barcode',
    label: 'Barcode',
    type: 'String',
  },
  {
    _id: 'paymentType',
    name: 'paymentType',
    label: 'Payment type',
    type: 'String',
  },
  {
    _id: 'pos',
    name: 'pos',
    label: 'POS',
    type: 'String',
  },
];

const getNestedSchema = (path: unknown) => {
  if (!path || typeof path !== 'object' || !('schema' in path)) {
    return undefined;
  }

  return path.schema instanceof Schema ? path.schema : undefined;
};

export const buildPosOrderFields = async (schema: Schema) => {
  let fields: TPosOrderField[] = [
    ...POS_ORDER_EXTENDED_FIELDS.map((field) => ({ ...field })),
    ...(await generateFieldsFromSchema(schema, '')),
  ];

  for (const name of Object.keys(schema.paths)) {
    const nestedSchema = getNestedSchema(schema.paths[name]);

    if (nestedSchema) {
      fields = [
        ...fields,
        ...(await generateFieldsFromSchema(nestedSchema, `${name}.`)),
      ];
    }
  }

  return fields.map((field) =>
    field.name === 'items.productId'
      ? {
          ...field,
          selectionConfig: {
            queryName: 'products',
            labelField: 'name',
          },
        }
      : field,
  );
};

export const generatePosOrderFields = (models: IModels) =>
  buildPosOrderFields(models.PosOrders.schema);
