const CarCategories = {
  carCount(category, {}, { models }) {
    return models.Cars.countDocuments({
      categoryId: category._id
      // status: { $ne: "Deleted" },
    });
  }
};

export default CarCategories;
