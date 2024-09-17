import {
  checkPermission,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { CTAX_ROW_STATUS } from '../../../models/definitions/ctaxRow';

const generateFilterCat = async ({
  kinds,
  searchValue,
  status,
}) => {
  const filter: any = {};
  filter.status = { $nin: [CTAX_ROW_STATUS.DELETED] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (kinds?.length) {
    filter.kind = { $in: kinds };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    filter.number = new RegExp(`.*${searchValue}.*`, 'i');
  }

  return filter;
};

const ctaxRowQueries = {
  async ctaxRows(
    _root,
    { kinds, searchValue, status },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      kinds,
      status,
      searchValue
    });

    const sortParams: any = { number: 1 };

    return await models.CtaxRows.find(filter).sort(sortParams).lean();
  },

  async ctaxRowsCount(
    _root,
    { kinds, searchValue, status },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      searchValue,
      status,
      kinds,
    });
    return models.CtaxRows.find(filter).countDocuments();
  },

  async ctaxRowDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.CtaxRows.findOne({ _id }).lean();
  },
};

checkPermission(ctaxRowQueries, 'ctaxRows', 'showCtaxRows', []);

export default ctaxRowQueries;
