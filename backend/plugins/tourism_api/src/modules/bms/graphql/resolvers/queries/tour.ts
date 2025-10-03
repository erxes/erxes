import { cursorPaginate } from 'erxes-api-shared/src/utils';
import { IContext } from '~/connectionResolvers';
import {
  ITourDocument,
  TourFilterParams,
  TourListResponse,
} from '@/bms/@types/tour';

function buildDateSelector(
  selector: Record<string, any>,
  field: 'startDate' | 'endDate',
  date1?: Date,
  date2?: Date,
) {
  if (date1 || date2) {
    if (!selector[field]) {
      selector[field] = {};
    }
    if (date1) {
      selector[field]['$gte'] = date1;
    }
    if (date2) {
      selector[field]['$lte'] = date2;
    }
  }
}

const tourQueries = {
  async bmsTours(
    _root: any,
    {
      categories,
      status,
      innerDate,
      branchId,
      tags,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      ...params
    }: TourFilterParams,
    { models }: IContext,
  ): Promise<TourListResponse> {
    const selector: Record<string, any> = {};

    if (categories?.length) {
      selector.categories = { $in: categories };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.branchId = branchId;
    }
    if (tags?.length) {
      selector.tags = { $in: tags };
    }
    if (innerDate) {
      selector.startDate = { $lte: innerDate };
      selector.endDate = { $gte: innerDate };
    }

    buildDateSelector(selector, 'startDate', startDate1, startDate2);
    buildDateSelector(selector, 'endDate', endDate1, endDate2);

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Tours,
      params,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async bmsTourDetail(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ): Promise<ITourDocument | null> {
    return models.Tours.findById(_id);
  },
};

export default tourQueries;
