import { IContext } from '~/connectionResolvers';
import { IStructureDocument } from '@/organization/structure/@types/structure';

export default {
  async supervisor(
    structure: IStructureDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Users.findOne({ _id: structure.supervisorId });
  },
};
