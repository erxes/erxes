import * as json2csv from 'json2csv';
import { generateModels } from '../../../connectionResolvers';

export const generateErrors = async (args: any, subdomain) => {
  const { contentType, importHistoryId } = args;
  const { Parser } = json2csv;
  const models = await generateModels(subdomain);

  const importHistory = await models.ImportHistory.findOne({
    _id: importHistoryId
  });

  let errors = [] as any;

  const parser = new Parser();

  let csv = '';

  if (importHistory) {
    const errorMsgs = importHistory.errorMsgs as any;

    if (errorMsgs.length > 0) {
      errors = errorMsgs.filter(msgs => msgs.contentType === contentType);
    } else {
      csv = parser.parse([{ errors: 'empty' }]);

      return {
        name: `${contentType}-errors`,
        response: csv
      };
    }
  }

  csv = parser.parse(errors);

  return {
    name: `${contentType}-errors`,
    response: csv
  };
};
