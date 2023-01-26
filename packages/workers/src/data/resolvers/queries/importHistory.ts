import { paginate, getImportCsvInfo, getCsvHeadersInfo } from '../../utils';
import { IContext } from '../../../connectionResolvers';

const importHistoryQueries = {
  /**
   * Import history list
   */
  async importHistories(
    _root,
    { type, ...args }: { page: number; perPage: number; type: string },
    { models }: IContext
  ) {
    const filter: { [key: string]: any } = {};

    if (type) {
      filter['contentTypes.contentType'] = type;
    }

    const list = await paginate(models.ImportHistory.find(filter), args).sort({
      date: -1
    });

    const count = models.ImportHistory.find(filter).countDocuments();

    return { list, count };
  },

  async importHistoryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    const importHistory = await models.ImportHistory.getImportHistory(_id);

    importHistory.errorMsgs = (importHistory.errorMsgs || []).slice(0, 100);

    return importHistory;
  },

  async importHistoryGetColumns(
    _root,
    { attachmentName }: { attachmentName: string }
  ) {
    const values = (await getImportCsvInfo(attachmentName)) as any;

    const object = {} as any;

    values.map(value => {
      Object.keys(value).forEach(key => {
        if (!object[key]) {
          object[key] = [value[key]];
        } else {
          object[key].push(value[key]);
        }
      });
    });

    return object;
  },

  async importHistoryGetDuplicatedHeaders(
    _root,
    { attachmentNames }: { attachmentNames: string[] }
  ) {
    const headers = [] as any;

    for (const attachmentName of attachmentNames) {
      const results: any = await getCsvHeadersInfo(attachmentName);

      headers.push(...results.split(','));
    }

    const duplicates = headers.filter(
      (item, index) => index !== headers.indexOf(item)
    );

    return duplicates;
  }
};

export default importHistoryQueries;
