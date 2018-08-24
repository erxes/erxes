import * as Random from "meteor-random";
import { Fields, ImportHistory } from "./";
import { IUserDocument } from "./definitions/users";

/*
 * Mongoose field options wrapper
 */
export const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  if (pkey) {
    options.type = String;
    options.unique = true;
    options.default = () => Random.id();
  }

  return options;
};

interface IBulkInsertInputs {
  fieldNames: string[];
  fieldValues: string[];
  user: IUserDocument;
  basicInfos: any;
  contentType: string;
  create: any;
}

export const bulkInsert = async (params: IBulkInsertInputs) => {
  const errMsgs = [];
  const properties = [];

  const {
    fieldNames,
    fieldValues,
    user,
    basicInfos,
    contentType,
    create
  } = params;

  const history = {
    ids: [],
    success: 0,
    total: fieldValues.length,
    contentType,
    failed: 0
  };

  const { MAX_IMPORT_SIZE = 600 } = process.env;

  if (fieldValues.length > MAX_IMPORT_SIZE) {
    return [`You can only import max ${MAX_IMPORT_SIZE} at a time`];
  }

  // Checking field names, All field names must be configured correctly
  const checkFieldNames = async fields => {
    for (const fieldName of fields) {
      const property: { [key: string]: any } = {
        isCustomField: false
      };

      const fieldObj = await Fields.findOne({ text: fieldName });

      // Collecting basic fields
      if (basicInfos.includes(field)) {
        property.name = fieldName;
      }

      // Collecting custom fields
      if (fieldObj) {
        property.isCustomField = true;
        property.id = fieldObj._id;
      }

      properties.push(property);

      if (!basicInfos.includes(field) && !fieldObj) {
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
  for (const fieldValue of fieldValues) {
    const coc = {
      customFieldsData: {}
    };

    let colIndex = 0;

    // Iterating through detailed properties
    for (const property of properties) {
      // Checking if it is basic info field
      if (property.isCustomField === false) {
        coc[property.name] = fieldValue[colIndex];
      } else {
        coc.customFieldsData[property.id] = fieldValue[colIndex];
      }

      colIndex++;
    }

    // Creating coc
    await create(coc)
      .then(cocObj => {
        // Increasing success count
        history.success++;
        history.ids.push(cocObj._id);
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
};
