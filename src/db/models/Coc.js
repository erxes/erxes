import { Fields, ImportHistory } from './';

class Coc {
  /**
   * Imports coc with basic fields and custom properties
   * @param {String[]} fieldNames - Coc field names
   * @param {String[]} fieldValues - Coc field values
   *
   * @return {Promise} Error messages
  */
  static async bulkInsert(fieldNames, fieldValues, { user }) {
    const errMsgs = [];
    const properties = [];
    const cocType = this.getCocType();
    const contentType = cocType.toLowerCase();

    const history = {
      ids: [],
      success: 0,
      total: fieldValues.length,
      contentType,
      failed: 0,
    };

    const { MAX_IMPORT_SIZE = 600 } = process.env;

    if (fieldValues.length > MAX_IMPORT_SIZE) {
      return [`You can only import max ${MAX_IMPORT_SIZE} at a time`];
    }

    // Checking field names, All field names must be configured correctly
    const checkFieldNames = async fieldNames => {
      for (let field of fieldNames) {
        const property = {
          isCustomField: false,
        };

        const fieldObj = await Fields.findOne({ text: field });

        // Collecting basic fields
        if (this.getBasicInfos().includes(field)) {
          property.name = field;
        }

        // Collecting customer fields
        if (fieldObj) {
          property.isCustomField = true;
          property.id = fieldObj._id;
        }

        properties.push(property);

        if (!this.getBasicInfos().includes(field) && !fieldObj) {
          errMsgs.push(`Bad column name ${field}`);
        }
      }
    };

    await checkFieldNames(fieldNames);

    // If field name configured wrong, immediately sending error message
    if (errMsgs.length > 0) {
      return errMsgs;
    }

    let rowIndex = 0;

    // Iterating field values
    for (let fieldValue of fieldValues) {
      const coc = {
        customFieldsData: {},
      };

      let colIndex = 0;

      // Iterating through detailed properties
      for (let property of properties) {
        // Checking if it is basic info field
        if (property.isCustomField === false) {
          coc[property.name] = fieldValue[colIndex];
        } else {
          coc.customFieldsData[property.id] = fieldValue[colIndex];
        }

        colIndex++;
      }

      // Creating coc
      await this.create(coc)
        .then(coc => {
          // Increasing success count
          history.success++;
          history.ids.push(coc._id);
        })
        .catch(e => {
          // Increasing failed count and pushing into error message
          history.failed++;
          errMsgs.push(`${e.message} at the row ${rowIndex + 1}`);
        });

      rowIndex++;
    }

    // Whether successfull or not creating import history
    await ImportHistory.createHistory(history, user);

    return errMsgs;
  }
}

export default Coc;
