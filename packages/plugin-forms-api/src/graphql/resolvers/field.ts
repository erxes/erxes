import { IContext } from '../../connectionResolver';
import { sendProductsMessage } from '../../messageBroker';
import {
  IFieldDocument,
  IFieldGroupDocument
} from '../../models/definitions/fields';

export const field = {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Fields.findOne({ _id });
  },
  name(root: IFieldDocument) {
    return `erxes-form-field-${root._id}`;
  },

  lastUpdatedUser(root: IFieldDocument) {
    const { lastUpdatedUserId } = root;

    if (!lastUpdatedUserId) {
      return;
    }

    return {
      __typename: 'User',
      _id: lastUpdatedUserId
    };
  },

  associatedField(root: IFieldDocument, _params, { models }: IContext) {
    const { associatedFieldId } = root;

    // Returning field that associated with form field
    return models.Fields.findOne({ _id: associatedFieldId });
  },

  async groupName(root: IFieldDocument, _params, { models }: IContext) {
    const { groupId } = root;

    const group = await models.FieldsGroups.findOne({ _id: groupId });
    return group && group.name;
  },

  async products(root: IFieldDocument, _args, { subdomain }: IContext) {
    const { productCategoryId } = root;

    if (!productCategoryId) {
      return;
    }

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          categoryId: productCategoryId
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return (products || []).map(({ _id }) => ({
      __typename: 'Product',
      _id
    }));
  }
};

export const fieldsGroup = {
  fields(root: IFieldGroupDocument, _params, { models }: IContext) {
    // Returning all fields that are related to the group
    return models.Fields.find({
      groupId: root._id,
      contentType: root.contentType
    }).sort({ order: 1 });
  },

  lastUpdatedUser(fieldGroup: IFieldGroupDocument) {
    const { lastUpdatedUserId } = fieldGroup;

    if (!lastUpdatedUserId) {
      return;
    }

    return {
      __typename: 'User',
      _id: lastUpdatedUserId
    };
  }
};
