import { IContext } from '../../../connectionResolver';

const commentQueries = {
  async clientPortalComments(
    _root,
    { typeId, type }: { typeId: string; type: string },
    { models }: IContext
  ) {
    return models.Comments.find({ typeId, type });
  }
};

export default commentQueries;
