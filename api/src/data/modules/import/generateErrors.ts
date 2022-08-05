import * as json2csv from 'json2csv';
import ImportHistories from '../../../db/models/ImportHistory';

export const generateErrors = async (args: any) => {
  const { contentType, importHistoryId } = args;
  const { Parser } = json2csv;

  const importHistory = await ImportHistories.findOne({ _id: importHistoryId });

  let errors = [] as any;

  if (importHistory) {
    const errorMsgs = importHistory.errorMsgs as any;

    if (errorMsgs.length > 0) {
      errors = errorMsgs.filter(msgs => msgs.contentType === contentType);
    }
  }

  const parser = new Parser();
  const csv = parser.parse(errors);

  return {
    name: `${contentType}-errors`,
    response: csv
  };
};
