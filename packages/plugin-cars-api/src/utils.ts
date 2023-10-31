import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import * as _ from 'underscore';
import { generateModels } from './connectionResolver';

const gatherNames = async params => {
  const {
    collection,
    idFields,
    foreignKey,
    prevList,
    nameFields = []
  } = params;
  let options = [] as any;

  if (prevList && prevList.length > 0) {
    options = prevList;
  }

  const uniqueIds = _.compact(_.uniq(idFields));

  for (const id of uniqueIds) {
    const item = await collection.findOne({ _id: id });
    let name: string = `item with id "${id}" has been deleted`;

    if (item) {
      for (const n of nameFields) {
        if (item[n]) {
          name = item[n];
        }
      }
    }

    options.push({ [foreignKey]: id, name });
  }

  return options;
};

const gatherCarFieldNames = async (models, doc, prevList = null) => {
  let options = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.categoryId) {
    options = await gatherNames({
      collection: models.CarCategories,
      idFields: [doc.categoryId],
      foreignKey: 'categoryId',
      prevList: options,
      nameFields: ['name']
    });
  }

  return options;
};

export const gatherDescriptions = async params => {
  const { action, obj, type, updatedDocument, extraParams } = params;
  const { models } = extraParams;

  let extraDesc = [] as any;
  let description = '';

  switch (type) {
    case 'car': {
      description = `${obj.plateNumber || obj.vinNumber} has been ${action}d`;

      extraDesc = await gatherCarFieldNames(models, obj);

      if (updatedDocument) {
        extraDesc = await gatherCarFieldNames(
          models,
          updatedDocument,
          extraDesc
        );
      }
      break;
    }
    case 'car-category': {
      description = `"${obj.name}" has been ${action}d`;

      const parentIds: string[] = [];

      if (obj.parentId) {
        parentIds.push(obj.parentId);
      }

      if (updatedDocument && updatedDocument.parentId !== obj.parentId) {
        parentIds.push(updatedDocument.parentId);
      }

      if (parentIds.length > 0) {
        extraDesc = await gatherNames({
          collection: models.CarCategories,
          idFields: parentIds,
          foreignKey: 'parentId',
          nameFields: ['name']
        });
      }
    }
    default:
      break;
  }
  return { extraDesc, description };
};

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { Cars } = models;

  const schema = Cars.schema as any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  fields = fields.filter(field => {
    if (
      field.name === 'parentCarCategoryId' ||
      field.name === 'carCategoryId'
    ) {
      return false;
    }

    return true;
  });

  const parentCategories = await models.CarCategories.find({
    $or: [{ parentId: null }, { parentId: '' }]
  });

  const categories = await models.CarCategories.find({
    $or: [{ parentId: { $ne: null } }, { parentId: { $ne: '' } }]
  });

  const additionalFields = [
    {
      _id: Math.random(),
      name: 'parentCarCategoryId',
      label: 'Category',
      type: 'String',
      selectOptions: parentCategories.map(category => ({
        value: category._id,
        label: category.name
      }))
    },
    {
      _id: Math.random(),
      name: 'carCategoryId',
      label: 'Sub category',
      type: 'String',
      selectOptions: categories.map(category => ({
        value: category._id,
        label: category.name
      }))
    },
    {
      _id: Math.random(),
      name: 'drivers',
      label: 'Driver(s)',
      type: 'String',
      selectOptions: undefined
    },
    {
      _id: Math.random(),
      name: 'companies',
      label: 'Company(s)',
      type: 'String',
      selectOptions: undefined
    }
  ];

  return [...additionalFields, ...fields];
};
