import { Fields } from './';

class Coc {
  /**
   * Read customers from xls file and saves into database
   * @param {Object} sheet - Xls file sheet
   *
   * @return {Promise} Success and failed counts
  */
  static async bulkInsert(fieldNames, fieldValues) {
    console.log(this.getBasicInfos());

    const response = {
      errMsgs: [],
      total: 0,
      success: 0,
      failed: 0,
    };

    const checkFieldNames = async fieldNames => {
      for (let field of fieldNames) {
        const fieldObj = await Fields.find({ text: field });

        if (!this.basicInfos.includes(field) || !fieldObj) {
          response.errMsgs.push(`Bad column name ${field}`);
        }
      }
    };

    // await checkFieldNames();

    if (response.errMsgs.length > 0) {
      return response;
    }

    const customers = [];

    let rowIndex = 0;

    for (let row of fieldValues) {
      const customer = {
        customFieldsData: {},
      };

      let colIndex = 0;

      for (let column of fieldNames) {
        // Validating basic info column name
        if (this.basicInfos.includes(column)) {
          //Setting basic info value
          customer[column] = row[colIndex];
        } else {
          // If its not basic info column, looking from custom property
          const property = await Fields.findOne({
            contentType: 'customer',
            text: column,
          });
          // Setting value for customer property
          customer.customFieldsData[property._id] = row[colIndex];
        }

        colIndex++;
      }

      // Casting into array of object
      customers.push(customer);

      rowIndex++;
    }

    // Saving customers into database
    rowIndex = 0;

    for (let customer of customers) {
      try {
        await this.createCustomer(customer);
        response.success++;
      } catch (e) {
        response.failed++;
        response.errMsgs.push(`${e.message} at the row ${rowIndex + 1}`);
      }

      rowIndex++;
    }

    response.total = customers.length;

    return response;
  }
}

export default Coc;
