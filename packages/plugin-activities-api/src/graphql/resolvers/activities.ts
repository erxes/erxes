import { sendCoreMessage } from "../../messageBroker";

const Activities = {
  async category(activity, {}, { models }) {
    return models.AcvitityCategories.findOne({
      _id: activity?.categoryId,
    });
  },
  async commentCount(activity, {}, { models }) {
    return models.Comments.find({
      contentId: activity._id,
    }).countDocuments();
  },
};

export default Activities;
