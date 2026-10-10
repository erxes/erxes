import { IContext } from '~/connectionResolvers';
import { VAT_ROW_STATUS } from '@/accounting/@types/vatRow';
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
  filter.status = { $nin: [VAT_ROW_STATUS.DELETED] };

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

const vatRowQueries = {
  async vatRows(
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

    return await models.VatRows.find(filter)
      .sort(sortParams)
      .collation({ locale: 'en', numericOrdering: true })
      .lean();
  },

  async vatRowsCount(
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
    return models.VatRows.find(filter).countDocuments();
  },

  async vatRowDetail(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readTaxRows');
    validateRequiredId(_id);
    return models.VatRows.findOne({ _id }).lean();
  },
};

export { vatRowQueries };
