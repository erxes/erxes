import { IContext } from '@erxes/api-utils/src/types';
import { ZmsDictionaries, ZmsLogs, Zmss } from '../../models';
import { InquireApi } from '../../zms/api/getRefer';
import { getConfig } from '../../messageBroker';

const zmsQueries = {
  async getZmsDictionary(_root, { _id }, _context: IContext) {
    return ZmsDictionaries.findOne({ _id });
  },

  async getDictionaries(_root, { isParent, parentId }, _context: IContext) {
    const query: any = { isParent: isParent ? true : { $ne: true } };
    if (parentId) {
      query.parentId = parentId;
    }
    const dictionaries = await ZmsDictionaries.find(query).lean();
    return dictionaries;
  },

  async getZms(_root, { _id }, _context: IContext) {
    return Zmss.findOne({ _id });
  },

  async getZmses() {
    const zmss = await Zmss.find({}).lean();
    return zmss;
  },

  async getLogs() {
    return await ZmsLogs.find({}).lean();
  },
  async getZmsLogs(_root, { zmsId }, _context: IContext) {
    const query: any = { zmsId: zmsId };
    return await ZmsLogs.find(query).lean();
  },
  async getInquire(
    _root,
    {
      typeInquire,
      keyword,
      reportPurpose,
      organizationType,
      foreignCitizen,
      resultType,
      liveStockYear,
      subdomain
    }
  ) {
    const config = await getConfig('zmsConfig', subdomain, '');
    const refer = new InquireApi({
      client_id: config.client_id,
      secretKey: config.secretKey
    });
    const inquiries = refer.getInquire({
      typeInquire,
      keyword,
      reportPurpose,
      organizationType,
      resultType,
      foreignCitizen,
      liveStockYear
    });
    return inquiries;
  }
};
export default zmsQueries;
