import { IContext } from "../../connectionResolver";

const CurriculumCategories = {
  async curriculumCount(category, {}, { models }: IContext) {
    return models.Curriculum.countDocuments({
      categoryId: category._id,
      // status: { $ne: "Deleted" },
    });
  },
};

export default CurriculumCategories;
