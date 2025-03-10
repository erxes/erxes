const Programs = {
  async category(program, {}, { models }) {
    return models.ProgramCategories.findOne({
      _id: program?.categoryId,
    });
  },
};

export default Programs;
