import {
  FIELD_CONTENT_TYPES,
  FIELDS_GROUPS_CONTENT_TYPES
} from '../../../data/constants';
import { Fields, FieldsGroups } from '../../../db/models';
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
        { name: 'industry', label: 'Industry', order: 4 },
        { name: 'plan', label: 'Plan', order: 5 },
        { name: 'lastSeenAt', label: 'Last seen at', order: 6 },
        { name: 'sessionCount', label: 'Session count', order: 7 }
      ];
    }

    if (contentType === FIELD_CONTENT_TYPES.PRODUCT) {
      return [
        { name: 'categoryCode', label: 'Category Code', order: 0 },
        { name: 'code', label: 'Code', order: 1 },
        { name: 'name', label: 'Name', order: 1 }
      ];
    }

    return [
      { name: 'location.country', label: 'Country', order: 0 },
      { name: 'firstName', label: 'First name', order: 1 },
      { name: 'lastName', label: 'Last name', order: 2 },
      { name: 'primaryEmail', label: 'Primary email', order: 3 },
      { name: 'lastSeenAt', label: 'Last seen at', order: 4 },
      { name: 'sessionCount', label: 'Session count', order: 5 },
      { name: 'profileScore', label: 'Profile score', order: 6 }
    ];
  }
};

requireLogin(fieldQueries, 'fieldsCombinedByContentType');
requireLogin(fieldQueries, 'fieldsDefaultColumnsConfig');

checkPermission(fieldQueries, 'fields', 'showForms', []);

const fieldsGroupQueries = {
  /**
   * Fields group list
   */
  fieldsGroups(
    _root,
    { contentType }: { contentType: string },
    { commonQuerySelector }: IContext
  ) {
    const query: any = commonQuerySelector;

    // querying by content type
    query.contentType = contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER;

    return FieldsGroups.find(query).sort({ order: 1 });
  }
};

checkPermission(fieldsGroupQueries, 'fieldsGroups', 'showForms', []);

export { fieldQueries, fieldsGroupQueries };
