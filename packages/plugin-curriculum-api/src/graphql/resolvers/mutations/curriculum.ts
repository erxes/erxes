import {
  checkPermission,
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
} from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const curriculumMutations = {
  /**
   * Creates a new curriculum
   */
  curriculumsAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }
  ) => {
    const curriculum = await models.Curriculum.createCurriculum(
      docModifier(doc),
      user
    );

    await putCreateLog(
      subdomain,
      {
        type: "curriculum:curriculum",
        newData: doc,
        object: curriculum,
        extraParams: { models },
        description: `"${curriculum.name}" has been created`,
      },
      user
    );

    return curriculum;
  },
  /**
   * Edits a new curriculum
   */
  curriculumsEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }
  ) => {
    const curriculum = await models.Curriculum.getCurriculum(_id);
    const updated = await models.Curriculum.updateCurriculum(_id, doc);

    await putUpdateLog(
      subdomain,
      {
        type: "cars:car",
        object: curriculum,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models },
        description: `"${curriculum.name}" has been updated`,
      },
      user
    );

    return updated;
  },
  /**
   * Removes a single curriculum
   */
  curriculumsRemove: async (
    _root,
    { curriculumIds }: { curriculumIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const curriculums = await models.Curriculum.find({
      _id: { $in: curriculumIds },
    }).lean();

    await models.Curriculum.removeActivities(curriculumIds);

    for (const curriculum of curriculums) {
      await putDeleteLog(
        subdomain,
        {
          type: "cars:car",
          object: curriculum,
          description: `"${curriculum.name}" has been deleted`,
          extraParams: { models },
        },
        user
      );
    }

    return curriculumIds;
  },
  /**
   * Create a curriculum category
   */
  curriculumCategoriesAdd: async (
    _root,
    doc,
    { docModifier, models, subdomain, user }
  ) => {
    const curriculumCategory =
      await models.CurriculumCategories.createCurriculumCategory(
        docModifier(doc)
      );

    await putCreateLog(
      subdomain,
      {
        type: "cars:car-category",
        newData: { ...doc, order: curriculumCategory.order },
        object: curriculumCategory,
        description: `"${curriculumCategory.name}" has been created`,
        extraParams: { models },
      },
      user
    );

    return curriculumCategory;
  },
  /**
   * Delete a curriculum category
   */
  curriculumCategoriesRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) => {
    const curriculumCategory =
      await models.CurriculumCategories.getCurriculumCatogery({
        _id,
      });
    const removed =
      await models.CurriculumCategories.removeCurriculumCategory(_id);

    await putDeleteLog(
      subdomain,
      {
        type: "cars:car-category",
        object: curriculumCategory,
        description: `"${curriculumCategory.name}" has been deleted`,
        extraParams: { models },
      },
      user
    );

    return removed;
  },
};

checkPermission(curriculumMutations, "curriculumsAdd", "curriculumsAdd");
checkPermission(curriculumMutations, "curriculumsEdit", "curriculumsEdit");
checkPermission(curriculumMutations, "curriculumsRemove", "curriculumsRemove");

export default curriculumMutations;
