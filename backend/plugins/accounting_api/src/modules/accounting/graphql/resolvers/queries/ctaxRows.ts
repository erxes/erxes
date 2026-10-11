import { IContext } from '~/connectionResolvers';
import { CTAX_ROW_STATUS } from '@/accounting/@types/ctaxRow';
import { validateRequiredId } from '../../validateRequired';
import { escapeRegExp } from 'erxes-api-shared/utils';

const generateFilterCat = async ({
  kinds,
  searchValue,
  status,
}: {
  kinds?: string[];
  searchValue?: string;
  status?: string;
}) => {
  const filter: Record<string, unknown> = {};
  filter.status = { $nin: [CTAX_ROW_STATUS.DELETED] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (kinds?.length) {
    filter.kind = { $in: kinds };
  }

  if (searchValue) {
    const regex = new RegExp(escapeRegExp(searchValue), 'i');
    filter.name = regex;
    filter.number = regex;
  }

  return filter;
};

const ctaxRowQueries = {
  async ctaxRows(
    _root,
    { kinds, searchValue, status },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readTaxRows');
    const filter = await generateFilterCat({
      kinds,
      status,
      searchValue,
    });

    const sortParams: any = { number: 1 };

    return await models.CtaxRows.find(filter)
      .sort(sortParams)
      .collation({ locale: 'en', numericOrdering: true })
      .lean();
  },

  async ctaxRowsCount(
    _root,
    { kinds, searchValue, status },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readTaxRows');
    const filter = await generateFilterCat({
      searchValue,
      status,
      kinds,
    });
    return models.CtaxRows.find(filter).countDocuments();
  },

  async ctaxRowDetail(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readTaxRows');
    validateRequiredId(_id);
    return models.CtaxRows.findOne({ _id }).lean();
  },
};

export { ctaxRowQueries };
