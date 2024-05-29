import { IContext } from '../../connectionResolver';
import { IStructureDocument } from '../../db/models/definitions/structures';

export default {
  supervisor(structure: IStructureDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: structure.supervisorId });
  }
};
