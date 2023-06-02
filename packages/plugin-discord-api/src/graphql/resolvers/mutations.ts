import { Accounts } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const discordMutations = {
  async discordAccountRemove(
    _root,
    { _id }: { _id: string },
    _context: IContext
  ) {
    await Accounts.removeAccount(_id);

    return 'deleted';
  }
};

export default discordMutations;
