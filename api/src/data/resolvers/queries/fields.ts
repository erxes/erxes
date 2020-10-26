import { EXTEND_FIELDS, FIELD_CONTENT_TYPES, FIELDS_GROUPS_CONTENT_TYPES } from '../../../data/constants';
import { Companies, Customers, Fields, FieldsGroups, Integrations, Products } from '../../../db/models';
import { fetchElk } from '../../../elasticsearch';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IFieldsDefaultColmns {
  [index: number]: { name: string; label: string; order: number } | {};
}

export interface IFieldsQuery {
  contentType: string;
  contentTypeId?: string;
}

const getIntegrations = async () => {
  return Integrations.aggregate([
    {
      $project: {
        _id: 0,
        label: '$name',
        value: '$_id',
      },
    },
  ]);
};

/*
 * Generates fields using given schema
 */
const generateFieldsFromSchema = async (queSchema: any, namePrefix: string) => {
  const queFields: any = [];

  // field definations
  const paths = queSchema.paths;

  const integrations = await getIntegrations();

  for (const name of Object.keys(paths)) {
    const path = paths[name];

    const label = path.options.label;
    const type = path.instance;
    const selectOptions = name === 'integrationId' ? integrations || [] : path.options.selectOptions;

    if (['String', 'Number', 'Date', 'Boolean'].includes(type) && label) {
      // add to fields list
      queFields.push({
        _id: Math.random(),
        name: `${namePrefix}${name}`,
        label,
        type: path.instance,
        selectOptions,
      });
    }
  }

  return queFields;
};

const fieldQueries = {
  /**
   * Fields list
   */
  fields(_root, { contentType, contentTypeId }: { contentType: string; contentTypeId: string }) {
    const query: IFieldsQuery = { contentType };

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    return Fields.find(query).sort({ order: 1 });
  },

  /**
   * Generates all field choices base on given kind.
   */
  async fieldsCombinedByContentType(
    _root,
    { contentType, excludedNames }: { contentType: string; excludedNames?: string[] },
  ) {
    let schema: any;
    let extendFields: Array<{ name: string; label?: string }> = [];
    let fields: Array<{ _id: number; name: string; label?: string }> = [];

    switch (contentType) {
      case FIELD_CONTENT_TYPES.COMPANY:
        schema = Companies.schema;
        break;

      case FIELD_CONTENT_TYPES.PRODUCT:
        schema = Products.schema;
        extendFields = EXTEND_FIELDS.PRODUCT;

        break;

      case FIELD_CONTENT_TYPES.CUSTOMER:
        schema = Customers.schema;
        break;
    }

    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [...fields, ...(await generateFieldsFromSchema(path.schema, `${name}.`))];
      }
    }

    const customFields = await Fields.find({
      contentType,
    });

    // extend fields list using custom fields data
    for (const customField of customFields) {
      const group = await FieldsGroups.findOne({ _id: customField.groupId });

      if (group && group.isVisible && customField.isVisible) {
        fields.push({
          _id: Math.random(),
          name: `customFieldsData.${customField._id}`,
          label: customField.text,
        });
      }
    }

    for (const extendFeild of extendFields) {
      fields.push({
        _id: Math.random(),
        ...extendFeild,
      });
    }

    if (contentType === 'company' || contentType === 'customer') {
      const aggre = await fetchElk(
        'search',
        contentType === 'company' ? 'companies' : 'customers',
        {
          size: 0,
          _source: false,
          aggs: {
            trackedDataKeys: {
              nested: {
                path: 'trackedData',
              },
              aggs: {
                fieldKeys: {
                  terms: {
                    field: 'trackedData.field',
                    size: 10000,
                  },
                },
              },
            },
          },
        },
        '',
        { aggregations: { trackedDataKeys: {} } },
      );

      const buckets = (aggre.aggregations.trackedDataKeys.fieldKeys || { buckets: [] }).buckets;

      for (const bucket of buckets) {
        fields.push({
          _id: Math.random(),
          name: `trackedData.${bucket.key}`,
          label: bucket.key,
        });
      }
    }

    return fields.filter(field => !(excludedNames || []).includes(field.name));
  },

  /**
   * Default list columns config
   */
  fieldsDefaultColumnsConfig(_root, { contentType }: { contentType: string }): IFieldsDefaultColmns {
    if (contentType === FIELD_CONTENT_TYPES.COMPANY) {
      return [
        { name: 'primaryName', label: 'Primary Name', order: 1 },
        { name: 'size', label: 'Size', order: 2 },
        { name: 'links.website', label: 'Website', order: 3 },
        { name: 'industry', label: 'Industry', order: 4 },
        { name: 'plan', label: 'Plan', order: 5 },
        { name: 'lastSeenAt', label: 'Last seen at', order: 6 },
        { name: 'sessionCount', label: 'Session count', order: 7 },
      ];
    }

    if (contentType === FIELD_CONTENT_TYPES.PRODUCT) {
      return [
        { name: 'categoryCode', label: 'Category Code', order: 0 },
        { name: 'code', label: 'Code', order: 1 },
        { name: 'name', label: 'Name', order: 1 },
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
    ];
  },
};

requireLogin(fieldQueries, 'fieldsCombinedByContentType');
requireLogin(fieldQueries, 'fieldsDefaultColumnsConfig');

checkPermission(fieldQueries, 'fields', 'showForms', []);

const fieldsGroupQueries = {
  /**
   * Fields group list
   */
  fieldsGroups(_root, { contentType }: { contentType: string }, { commonQuerySelector }: IContext) {
    const query: any = commonQuerySelector;

    // querying by content type
    query.contentType = contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER;

    return FieldsGroups.find(query).sort({ order: 1 });
  },
};

checkPermission(fieldsGroupQueries, 'fieldsGroups', 'showForms', []);

export { fieldQueries, fieldsGroupQueries };
