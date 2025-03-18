import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { IContext } from "../../connectionResolver";

import {
  IField,
  IFieldDocument,
  IFieldGroupDocument
} from "../../db/models/definitions/fields";

export const field = {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Fields.findOne({ _id });
  },

  name(root: IFieldDocument) {
    return `erxes-form-field-${root._id}`;
  },

  async lastUpdatedUser(root: IFieldDocument, _params, { models }: IContext) {
    const { lastUpdatedUserId } = root;

    if (!lastUpdatedUserId) {
      return;
    }

    return models.Users.findOne({ _id: lastUpdatedUserId });
  },

  async associatedField(root: IFieldDocument, _params, { models }: IContext) {
    const { associatedFieldId } = root;

    // Returning field that associated with form field
    return models.Fields.findOne({ _id: associatedFieldId });
  },

  async subFields(root: IFieldDocument, _params, { models }: IContext) {
    const { subFieldIds = [] } = root;
    const subfields = await models.Fields.find({ _id: { $in: subFieldIds } });

    return subfields.sort(
      (a, b) => subFieldIds.indexOf(a._id) - subFieldIds.indexOf(b._id)
    );
  },

  async products(root: IFieldDocument, _args, { models }: IContext) {
    const { productCategoryId } = root;

    if (!productCategoryId) {
      return;
    }

    // const products = await models.Products.find({
    //   categoryId: productCategoryId
    // });

    // return products.map(product => ({
    //   _id: product._id,
    //   name: product.name,
    //   unitPrice: product.unitPrice
    // }));

    return;
  }
};

export const fieldsGroup = {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Fields.findOne({ _id });
  },
  async fields(root: IFieldGroupDocument, _params, { models }: IContext) {
    // Returning all fields that are related to the group
    const fields = await models.Fields.find({
      groupId: root._id,
      contentType: root.contentType
    }).sort({ order: 1 });

    // Splitting code to array
    const splitted = root.code && root.code.split(":");

    if (splitted && splitted.length === 3 && splitted[2] === "relations") {
      const enabledFields: IField[] = [];
      for (const f of fields) {
        if (await isEnabled(f.relationType?.split(":")[0])) {
          enabledFields.push(f);
        }
      }

      return enabledFields;
    }

    return fields;
  },

  async lastUpdatedUser(
    fieldGroup: IFieldGroupDocument,
    _params,
    { models }: IContext
  ) {
    const { lastUpdatedUserId } = fieldGroup;

    if (!lastUpdatedUserId) {
      return;
    }

    return models.Users.findOne({ _id: lastUpdatedUserId });
  }
};
