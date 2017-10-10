import { Segments, Customers, Fields } from '../../../db/models';

export default {
  /**
   * Segments list
   * @return {Promise} segment objects
   */
  segments() {
    return Segments.find({});
  },

  /**
   * Only segment that has no sub segments
   * @return {Promise} segment objects
   */
  segmentsGetHeads() {
    return Segments.find({ subOf: { $exists: false } });
  },

  /**
   * Get one segment
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found segment
   */
  segmentDetail(root, { _id }) {
    return Segments.findOne({ _id });
  },

  /**
   * Generates field choices base on given kind. For example if kind is customer
   * then it will generate customer related fields
   *
   * @param {String} kind customer or company
   *
   * @return {[SegmentField]}
   * [{ name: 'messengerData.isActive', text: 'Messenger: is Active' }]
   */
  async segmentsGetFields() {
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
        name: `customFieldsData.${customField._id}`,
        label: customField.text,
      });
    });

    return fields;
  },
};
