import { Accounts } from '../../models';
import { IContext } from "@erxes/api-utils/src/types"

const {name}Mutations = {
  async {name}AccountRemove(_root, {_id}: {_id: string}, _context: IContext) {
    await Accounts.removeAccount(_id);

    return 'deleted';
  }
};

export default {name}Mutations;
