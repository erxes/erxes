import { Companies, Customers, Fields, FieldsGroups } from '../../../db/models';
import { FIELD_CONTENT_TYPES, FIELDS_GROUPS_CONTENT_TYPES } from '../../../data/constants';
import { moduleRequireLogin } from '../../permissions';

const fieldQueries = {
  /**
   * Fields list
   * @param {Object} args
   * @return {Promise} sorted fields list
   */
  fields(root, { contentType, contentTypeId }) {
    const query = { contentType };

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    return Fields.find(query).sort({ order: 1 });
  },

  /**
   * Generates all field choices base on given kind.
   * For example if kind is customer
   * then it will generate customer related fields
   *
   * @param {String} kind customer or company
   *
   * @return {[JSON]}
   * [{ name: 'messengerData.isActive', text: 'Messenger: is Active' }]
   */
  async fieldsCombinedByContentType(root, { contentType }) {
    /*
     * Generates fields using given schema
     * @param {Schema} schema Customers.schema etc ...
     * @param {namePrefix} sub field's prefix like messengerData. or empty str
     * @return {Array} array of fields
     */
    const generateFieldsFromSchema = (schema, namePrefix) => {
      const fields = [];

      // field definations
      const paths = schema.paths;

      schema.eachPath(name => {
        const label = paths[name].options.label;

        // add to fields list
        if (label) {
          fields.push({
            _id: Math.random(),
            name: `${namePrefix}${name}`,
            label,
          });
        }
      });

      return fields;
    };

    let schema = Companies.schema;

    if (contentType === FIELD_CONTENT_TYPES.CUSTOMER) {
      schema = Customers.schema;
    }

    // generate list using customer or company schema
    let fields = generateFieldsFromSchema(schema, '');

    schema.eachPath(name => {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [...fields, ...generateFieldsFromSchema(path.schema, `${name}.`)];
      }
    });

    const customFields = await Fields.find({ contentType });

    // extend fields list using custom fields
    for (const customField of customFields) {
      const group = await FieldsGroups.findOne({ _id: customField.groupId });

      if (group.isVisible && customField.isVisible) {
        fields.push({
          _id: Math.random(),
          name: `customFieldsData.${customField._id}`,
          label: customField.text,
        });
      }
    }

    return fields;
  },

  /**
   * Default list columns config
   */
  fieldsDefaultColumnsConfig(root, { contentType }) {
    if (contentType === FIELD_CONTENT_TYPES.CUSTOMER) {
      return [
        { name: 'firstName', label: 'First name', order: 1 },
        { name: 'lastName', label: 'Last name', order: 1 },
        { name: 'primaryEmail', label: 'Primary email', order: 2 },
        { name: 'primaryPhone', label: 'Primary phone', order: 3 },
      ];
    }

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

    return [];
  },
};

moduleRequireLogin(fieldQueries);

const fieldsGroupQueries = {
  /**
   * Fields group list
   * @param {String} contentType - Filter by content type
   *
   * @return {Promise} Filtered fields group list
   */
  fieldsGroups(root, { contentType }) {
    const query = {};

    // querying by content type
    query.contentType = contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER;

    return FieldsGroups.find(query).sort({ order: 1 });
  },
};

moduleRequireLogin(fieldsGroupQueries);

export { fieldQueries, fieldsGroupQueries };
