import { IContext } from "../../connectionResolver";

const CarCategories = {
  async carCount(category, {}, { models }: IContext) {
    return models.Cars.countDocuments({
      categoryId: category._id
      // status: { $ne: "Deleted" },
    });
  }
};

export default CarCategories;
