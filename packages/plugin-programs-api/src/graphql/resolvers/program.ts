import { sendCoreMessage } from "../../messageBroker";

const Programs = {
  async category(program, {}, { models }) {
    return models.ProgramCategories.findOne({
      _id: program?.categoryId,
    });
  },
  async commentCount(program, {}, { models }) {
    return models.Comments.find({
      contentId: program._id,
    }).countDocuments();
  },
};

export default Programs;
