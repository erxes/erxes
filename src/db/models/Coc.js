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
    const cocType = this.getTypes().cocType;
    const contentType = this.getTypes().contentType;

    const history = {
      ids: [],
      success: 0,
      total: fieldValues.length,
      contentType,
      failed: 0,
      importedUserId: user._id,
    };

    // Checking field names, All field names must be configured correctly
    const checkFieldNames = async fieldNames => {
      for (let field of fieldNames) {
        const fieldObj = await Fields.findOne({ text: field });

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

      // Iterating for field names
      for (let fieldName of fieldNames) {
        // Checking if fieldName is in basic infos
        if (this.getBasicInfos().includes(fieldName)) {
          //Setting basic info value
          coc[fieldName] = fieldValue[colIndex];
        } else {
          // If its not in basic infos, looking from custom property
          const property = await Fields.findOne({
            contentType,
            text: fieldName,
          });

          // Setting value for property
          coc.customFieldsData[property._id] = fieldValue[colIndex];
        }

        colIndex++;
      }

      // Creating coc model
      await this[`create${cocType}`](coc)
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
    await ImportHistory.createHistory(history, user._id);

    return errMsgs;
  }
}

export default Coc;
