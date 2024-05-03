import {
  checkPermission,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { VAT_ROW_STATUS } from '../../../models/definitions/vatRow';

const generateFilterCat = async ({
  kinds,
  searchValue,
  status,
}) => {
  const filter: any = {};
  filter.status = { $nin: [VAT_ROW_STATUS.DELETED] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (kinds && kinds.length) {
    filter.kind = { $in: kinds };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    filter.number = new RegExp(`.*${searchValue}.*`, 'i');
  }

  return filter;
};

const vatRowQueries = {
  async vatRows(
    _root,
    { kinds, searchValue, status },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      kinds,
      status,
      searchValue
    });

    const sortParams: any = { order: 1 };

    return await models.VATRows.find(filter).sort(sortParams).lean();
  },

  async vatRowsTotalCount(
    _root,
    { kinds, searchValue, status },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      searchValue,
      status,
      kinds,
    });
    return models.VATRows.find(filter).countDocuments();
  },

  vatRowDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.VATRows.findOne({ _id }).lean();
  },
};

checkPermission(vatRowQueries, 'vatRows', 'showVatRows', []);

export default vatRowQueries;
