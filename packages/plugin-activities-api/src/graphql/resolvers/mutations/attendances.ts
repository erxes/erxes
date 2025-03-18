import { IContext } from "../../../connectionResolver";

const attendanceMutations = {
  markAttendance: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const comment = await models.Comments.createComment(doc);

    return comment;
  },
};

export default attendanceMutations;
