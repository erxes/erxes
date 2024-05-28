import { IUserDocument } from '@erxes/api-utils/src/types';

import { IContext } from '../../../connectionResolver';
import {
    sendCommonMessage,
    sendCoreMessage,
    sendTagsMessage,
} from '../../../messageBroker';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';

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
    params: IListParams,
    user: IUserDocument,
    subdomain: string,
) => {
    const { searchValue, tag, departmentId } = params;

    let filter: any = {};

    if (user && !user.isOwner) {
        const departments = await sendCoreMessage({
            subdomain,
            action: 'departments.find',
            data: {
                userIds: { $in: [user._id] },
            },
            isRPC: true,
            defaultValue: [],
        });

        const departmentIds = departments.map((d) => d._id);

        filter = {
            $or: [
                { visibility: { $exists: null } },
                { visibility: 'public' },
                {
                    $and: [
                        { visibility: 'private' },
                        {
                            $or: [
                                { selectedMemberIds: user._id },
                                { createdBy: user._id },
                                { departmentIds: { $in: departmentIds } },
                            ],
                        },
                    ],
                },
            ],
        };
    }

    if (searchValue) {
        filter.name = new RegExp(`.*${searchValue}.*`, 'i');
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
    async reportList(_root, params, { models, subdomain, user }: IContext) {

        const totalCount = models.Reports.countDocuments({});

        const filter = await generateFilter(params, user, subdomain);

        const list = models.Reports.find(filter).sort({
            createdAt: 1,
            name: 1,
        });

        return { list, totalCount };
    },

    async reportDetail(_root, { reportId }, { models }: IContext) {
        return models.Reports.getReport(reportId);
    },


    async reportsCountByTags(_root, _params, { models, subdomain }: IContext) {
        const counts = {};

        const tags = await sendTagsMessage({
            subdomain,
            action: 'find',
            data: {
                type: 'reports:reports',
            },
            isRPC: true,
            defaultValue: [],
        });

        for (const tag of tags) {
            counts[tag._id] = await models.Reports.find({
                tagIds: tag._id,
                status: { $ne: 'deleted' },
            }).countDocuments();
        }

        return counts;
    },
};

export default reportsQueries;
