import {
  FIELD_CONTENT_TYPES,
  FIELDS_GROUPS_CONTENT_TYPES
} from '../../../data/constants';
import { Boards, Fields, FieldsGroups, Pipelines } from '../../../db/models';
import { IFieldDocument } from '../../../db/models/definitions/fields';
import { fieldsCombinedByContentType } from '../../modules/fields/utils';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IFieldsDefaultColmns {
  [index: number]: { name: string; label: string; order: number } | {};
}

export interface IFieldsQuery {
  contentType: string;
  contentTypeId?: string;
  isVisible?: boolean;
  isDefinedByErxes?: boolean;
}

const fieldQueries = {
  /**
   * Fields list
   */
  fields(
    _root,
    {
      contentType,
      contentTypeId,
      isVisible
    }: { contentType: string; contentTypeId: string; isVisible: boolean }
  ) {
    const query: IFieldsQuery = { contentType };

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    if (isVisible) {
      query.isVisible = isVisible;
    }

    return Fields.find(query).sort({ order: 1 });
  },

  /**
   * Generates all field choices base on given kind.
   */
  async fieldsCombinedByContentType(_root, args) {
    return fieldsCombinedByContentType(args);
  },

  /**
   * Default list columns config
   */
  fieldsDefaultColumnsConfig(
    _root,
    { contentType }: { contentType: string }
  ): IFieldsDefaultColmns {
    if (contentType === FIELD_CONTENT_TYPES.COMPANY) {
      return [
        { name: 'primaryName', label: 'Primary Name', order: 1 },
        { name: 'size', label: 'Size', order: 2 },
        { name: 'links.website', label: 'Website', order: 3 },
        { name: 'industry', label: 'Industries', order: 4 },
        { name: 'plan', label: 'Plan', order: 5 },
        { name: 'lastSeenAt', label: 'Last seen at', order: 6 },
        { name: 'sessionCount', label: 'Session count', order: 7 }
      ];
    }

    if (contentType === FIELD_CONTENT_TYPES.PRODUCT) {
      return [
        { name: 'categoryCode', label: 'Category Code', order: 0 },
        { name: 'code', label: 'Code', order: 1 },
        { name: 'name', label: 'Name', order: 1 },
        { name: 'vendorCode', label: 'Vendor Code', order: 2 }
      ];
    }

    return [
      { name: 'location.country', label: 'Country', order: 0 },
      { name: 'firstName', label: 'First name', order: 1 },
      { name: 'lastName', label: 'Last name', order: 2 },
      { name: 'primaryEmail', label: 'Primary email', order: 3 },
      { name: 'lastSeenAt', label: 'Last seen at', order: 4 },
      { name: 'sessionCount', label: 'Session count', order: 5 },
      { name: 'profileScore', label: 'Profile score', order: 6 },
      { name: 'middleName', label: 'Middle name', order: 7 }
    ];
  },

  async fieldsInbox(_root) {
    const response: {
      customer?: IFieldDocument[];
      conversation?: IFieldDocument[];
      device?: IFieldDocument[];
    } = {};

    const customerGroup = await FieldsGroups.findOne({
      contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
      isDefinedByErxes: true
    });

    if (customerGroup) {
      response.customer = await Fields.find({ groupId: customerGroup._id });
    }

    const converstionGroup = await FieldsGroups.findOne({
      contentType: FIELDS_GROUPS_CONTENT_TYPES.CONVERSATION,
      isDefinedByErxes: true
    });

    if (converstionGroup) {
      response.conversation = await Fields.find({
        groupId: converstionGroup._id
      });
    }

    const deviceGroup = await FieldsGroups.findOne({
      contentType: FIELDS_GROUPS_CONTENT_TYPES.DEVICE,
      isDefinedByErxes: true
    });

    if (deviceGroup) {
      response.device = await Fields.find({ groupId: deviceGroup._id });
    }

    return response;
  },

  async fieldsItemTyped(_root) {
    const result = {};

    for (const ct of ['deal', 'ticket', 'task']) {
      result[ct] = [];

      const groups = await FieldsGroups.find({ contentType: ct });

      for (const group of groups) {
        const fields = await Fields.find({ groupId: group._id });
        const pipelines = await Pipelines.find({
          _id: { $in: group.pipelineIds || [] }
        });

        for (const pipeline of pipelines) {
          const board = await Boards.getBoard(pipeline.boardId);

          for (const field of fields) {
            result[ct].push({
              boardName: board.name,
              pipelineName: pipeline.name,
              fieldId: field._id,
              fieldName: field.text
            });
          }
        }
      }
    }

    return result;
  }
};

requireLogin(fieldQueries, 'fieldsCombinedByContentType');
requireLogin(fieldQueries, 'fieldsDefaultColumnsConfig');
requireLogin(fieldQueries, 'fieldsItemTyped');

checkPermission(fieldQueries, 'fields', 'showForms', []);

const fieldsGroupQueries = {
  /**
   * Fields group list
   */
  async fieldsGroups(
    _root,
    {
      contentType,
      isDefinedByErxes,
      boardId,
      pipelineId
    }: {
      contentType: string;
      isDefinedByErxes: boolean;
      boardId: string;
      pipelineId: string;
    },
    { commonQuerySelector }: IContext
  ) {
    let query: any = commonQuerySelector;

    // querying by content type
    query.contentType = contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER;

    if (boardId && pipelineId) {
      query = {
        contentType,
        $and: [
          {
            $or: [
              {
                boardIds: boardId
              },
              {
                boardIds: {
                  $size: 0
                }
              }
            ]
          },
          {
            $or: [
              {
                pipelineIds: pipelineId
              },
              {
                pipelineIds: {
                  $size: 0
                }
              }
            ]
          }
        ]
      };
    }

    if (isDefinedByErxes !== undefined) {
      query.isDefinedByErxes = isDefinedByErxes;
    }

    const groups = await FieldsGroups.find(query);

    return groups
      .map(group => {
        if (group.isDefinedByErxes) {
          group.order = -1;
        }
        return group;
      })
      .sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }
        return -1;
      });
  },

  getSystemFieldsGroup(
    _root,
    { contentType }: { contentType: string },
    { commonQuerySelector }: IContext
  ) {
    const query: any = commonQuerySelector;

    // querying by content type
    query.contentType = contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER;
    query.isDefinedByErxes = true;

    return FieldsGroups.findOne(query);
  }
};

checkPermission(fieldsGroupQueries, 'fieldsGroups', 'showForms', []);

export { fieldQueries, fieldsGroupQueries };
