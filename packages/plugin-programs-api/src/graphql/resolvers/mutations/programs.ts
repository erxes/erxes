import { putCreateLog, putDeleteLog, putUpdateLog } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const programMutations = {
  /**
   * Creates a new program
   */
  programsAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const program = await models.Programs.createProgram(docModifier(doc), user);

    await putCreateLog(
      subdomain,
      {
        type: "programs:program",
        newData: doc,
        object: program,
        extraParams: { models },
        description: `"${program.name}" has been created`,
      },
      user
    );

    return program;
  },
  /**
   * Edits a new program
   */
  programsEdit: async (_root, { _id, ...doc }, { models, user, subdomain }) => {
    const program = await models.Programs.getProgram(_id);
    const updated = await models.Programs.updateProgram(_id, doc);

    await putUpdateLog(
      subdomain,
      {
        type: "programs:program",
        object: program,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models },
        description: `"${program.name}" has been updated`,
      },
      user
    );

    return updated;
  },
  /**
   * Removes a single program
   */
  programsRemove: async (
    _root,
    { programIds }: { programIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const programs = await models.Programs.find({
      _id: { $in: programIds },
    }).lean();

    await models.Programs.removeActivities(programIds);

    for (const program of programs) {
      await putDeleteLog(
        subdomain,
        {
          type: "program:program",
          object: program,
          description: `"${program.name}" has been deleted`,
          extraParams: { models },
        },
        user
      );
    }

    return programIds;
  },
  /**
   * Create a program category
   */
  programCategoriesAdd: async (
    _root,
    doc,
    { docModifier, models, subdomain, user }
  ) => {
    const programCategory =
      await models.ProgramCategories.createProgramCategory(docModifier(doc));

    await putCreateLog(
      subdomain,
      {
        type: "programs:program-category",
        newData: { ...doc, order: programCategory.order },
        object: programCategory,
        description: `"${programCategory.name}" has been created`,
        extraParams: { models },
      },
      user
    );

    return programCategory;
  },
  /**
   * Delete a program category
   */
  programCategoriesRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) => {
    const programCategory = await models.ProgramCategories.getProgramCatogery({
      _id,
    });
    const removed = await models.ProgramCategories.removeProgramCategory(_id);

    await putDeleteLog(
      subdomain,
      {
        type: "programs:program-category",
        object: programCategory,
        description: `"${programCategory.name}" has been deleted`,
        extraParams: { models },
      },
      user
    );

    return removed;
  },
};

// checkPermission(programMutations, "programsAdd", "programsAdd");
// checkPermission(programMutations, "programsEdit", "programsEdit");
// checkPermission(programMutations, "programsRemove", "programsRemove");

export default programMutations;
