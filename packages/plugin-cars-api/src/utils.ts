import * as _ from 'underscore';

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
