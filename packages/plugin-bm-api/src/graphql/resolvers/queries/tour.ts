import { skip } from "node:test";
import { IContext } from "../../../connectionResolver";

const tourQueries = {
  async bmTours(
    _root,
    {
      categories,
      page = 1,
      perPage = 10,
      status,
      innerDate,
      branchId,
      tags,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      sortField = "createdAt",
      sortDirection = -1,
    },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
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
      selector.startDate["$lte"] = startDate2;
    }
    if (startDate1) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate["$gte"] = startDate1;
    }

    if (endDate2) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate["$lte"] = endDate2;
    }
    if (endDate1) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate["$gte"] = endDate1;
    }
    const list = await models.Tours.find(selector)
      .limit(perPage)
      .skip(skip)
      .sort({ [sortField]: sortDirection === -1 ? sortDirection : 1 });
    const total = await models.Tours.find(selector).countDocuments();

    return {
      list,
      total,
    };
  },
  async bmTourDetail(_root, { _id }, { models }: IContext) {
    return await models.Tours.findById(_id);
  },
};

export default tourQueries;
