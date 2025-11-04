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
      date_status,
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
    if (date_status) {
      selector.date_status = date_status;
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
  async bmToursGroup(
    _root,
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
      groupCode,
      date_status,
      ...params
    },
    { models }: IContext,
  ) {
    const selector: any = {};

    if (categories) {
      selector.categories = { $in: categories };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.status = branchId;
    }
    if (tags) {
      selector.tags = { $in: tags };
    }
    if (innerDate) {
      const dateToCheck = innerDate;
      selector.startDate = { $lte: dateToCheck };
      selector.endDate = { $gte: dateToCheck };

      // selector.$expr = {
      //   $lte: [
      //     dateToCheck,
      //     {
      //       $add: [
      //         '$startDate',
      //         { $multiply: ['$duration', 24 * 60 * 60 * 1000] },
      //       ],
      //     },
      //   ],
      // };
    }

    if (startDate2) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate['$lte'] = startDate2;
    }
    if (startDate1) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate['$gte'] = startDate1;
    }

    if (endDate2) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate['$lte'] = endDate2;
    }
    if (endDate1) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate['$gte'] = endDate1;
    }
    if (groupCode) {
      selector.groupCode = groupCode;
    }
    if (date_status) {
      selector.date_status = date_status;
    }

    // const list = await models.Tours.find({
    //   ...selector,
    //   groupCode: { $in: [null, ''] },
    // })
    //   .limit(perPage)
    //   .skip(skip)
    //   .sort({ [sortField]: sortDirection === -1 ? sortDirection : 1 });
    const total = await models.Tours.find({
      ...selector,
      groupCode: { $nin: [null, ''] },
    }).countDocuments();

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Tours,
      params,
      query: { ...selector, groupCode: { $nin: [null, ''] } },
    });

    const group = await models.Tours.aggregate([
      {
        $match: {
          ...selector,
          groupCode: { $nin: [null, ''] }, // Exclude null and empty strings
        },
      },
      {
        $group: {
          _id: '$groupCode', // group by category
          items: { $push: '$$ROOT' }, // push full documents into an array
        },
      },
    ]);
    return {
      list: [...group],
      total,
    };
  },
  async bmToursGroupDetail(_root, { groupCode, status }, { models }: IContext) {
    const selector: any = {};

    const list = await models.Tours.find({
      groupCode: groupCode,
      status: status,
    });

    return { _id: groupCode, items: list };
  },
};

export default tourQueries;
