import { IContext } from "../../connectionResolver";
import { IDashboardDocument, IReportDocument } from "../../db/models/definitions/insight";

export default {
    async chartsCount(item: IDashboardDocument | IReportDocument, { }, { models }: IContext) {
        try {
            const { _id } = item;

            return await models.Charts.find({ contentId: _id }).countDocuments();
        } catch (error) {
            return new Error(`Invalid ${error.path}: ${error.value}`);
        }
    },
    async isPinned(item: IDashboardDocument | IReportDocument, { }, { models, user }: IContext) {

        const { userIds } = item

        if ((userIds || []).includes(user._id)) {
            return true
        }

        return false
    }
}