import { checkPermission, requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { paginate } from '../../utils';

const queries = {
  async apps(_root, args, { models }: IContext) {
    const { searchValue } = args;
    const qry: any = {};
    if (searchValue) {
      qry.name = new RegExp(`.*${searchValue}.*`, 'i');
    }
    return models.Apps.find(qry).lean();
  },

  async appTotalCount(_root, args, { models }: IContext) {
    const { searchValue } = args;
    const qry: any = {};
    if (searchValue) {
      qry.name = new RegExp(`.*${searchValue}.*`, 'i');
    }
    return models.Apps.find(qry).countDocuments();
  },

  async appDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Apps.findOne({ _id });
  },

  async clientDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Clients.getClient({ _id });
  },

  async clientList(_root, args, { models }: IContext) {
    const { page = 1, perPage = 20, searchValue } = args;
    const qry: any = {};

    if (searchValue) {
      qry.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    const list = await paginate(
      models.Clients.find(qry).sort({ createdAt: -1 }),
      {
        page,
        perPage,
      }
    );

    const totalCount = await models.Clients.find(qry).countDocuments();

    return { list, totalCount };
  },
};


requireLogin(queries, 'clientDetail');
requireLogin(queries, 'clientList');


checkPermission(queries, 'clientList', 'showClients', {});
checkPermission(queries, 'clientDetail', 'showClients', {});

export default queries;
