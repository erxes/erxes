import { IUserDocument } from "@erxes/api-utils/src/types";

import { IContext, IModels } from "../../../connectionResolver";

interface IListParams {
  searchValue: string;
  ids?: string;
  page?: number;
  perPage?: number;
  sortField: string;
  sortDirection: number;
  tag: string;
  departmentId: string;
}

const generateFilter = async (
  models: IModels,
  params: IListParams,
  user: IUserDocument
) => {
  const { searchValue, tag, departmentId } = params;

  let filter: any = {};

  if (user && !user.isOwner) {
    const departments = await models.Departments.find({
      userIds: { $in: [user._id] }
    });

    const departmentIds = departments.map(d => d._id);

    filter = {
      $or: [
        { visibility: { $exists: null } },
        { visibility: "public" },
        {
          $and: [
            { visibility: "private" },
            {
              $or: [
                { selectedMemberIds: user._id },
                { createdBy: user._id },
                { departmentIds: { $in: departmentIds } }
              ]
            }
          ]
        }
      ]
    };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, "i");
  }
  if (tag) {
    filter.tagIds = { $in: [tag] };
  }
  if (departmentId) {
    filter.departmentIds = { $in: [departmentId] };
  }

  return filter;
};

const reportsQueries = {
  async reportList(_root, params, { models, user }: IContext) {
    const totalCount = await models.Reports.countDocuments({});

    const filter = await generateFilter(models, params, user);

    const list = await models.Reports.find(filter).sort({
      createdAt: 1,
      name: 1
    });

    return { list, totalCount };
  },

  async reportDetail(_root, { reportId }, { models }: IContext) {
    return models.Reports.getReport(reportId);
  },

  async reportsCountByTags(_root, _params, { models }: IContext) {
    const counts = {};

    const tags = await models.Tags.find({ type: "reports:reports" });

    for (const tag of tags) {
      counts[tag._id] = await models.Reports.find({
        tagIds: tag._id,
        status: { $ne: "deleted" }
      }).countDocuments();
    }

    return counts;
  }
};

export default reportsQueries;
