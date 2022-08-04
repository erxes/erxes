import { Users } from '../../db/models';
import { IStructureDocument } from '../../db/models/definitions/structures';

export default {
  supervisor(structure: IStructureDocument) {
    return Users.findOne({ _id: structure.supervisorId });
  }
};
