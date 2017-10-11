import { Customers, Fields } from '../../../db/models';

export default {
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
  async fieldsCombinedByContentType() {
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

    // generate list using customer schema
    let fields = generateFieldsFromSchema(Customers.schema, '');

    Customers.schema.eachPath(name => {
      const path = Customers.schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [...fields, ...generateFieldsFromSchema(path.schema, `${name}.`)];
      }
    });

    const customFields = await Fields.getCustomerFields();

    // extend fields list using custom fields
    customFields.forEach(customField => {
      fields.push({
        _id: Math.random(),
        name: `customFieldsData.${customField._id}`,
        label: customField.text,
      });
    });

    return fields;
  },
};
