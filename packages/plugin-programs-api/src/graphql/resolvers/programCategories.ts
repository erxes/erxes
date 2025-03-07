import { IContext } from "../../connectionResolver";

const ProgramCategories = {
  async programCount(category, {}, { models }: IContext) {
    return models.Programs.countDocuments({
      categoryId: category._id,
      // status: { $ne: "Deleted" },
    });
  },
};

export default ProgramCategories;
