import { Scripts } from '../../../db/models';
import { IScript } from '../../../db/models/definitions/scripts';
import { moduleRequireLogin } from '../../permissions';

interface IScriptsEdit extends IScript {
  _id: string;
}

const scriptMutations = {
  /**
   * Create new script
   */
  scriptsAdd(_root, doc: IScript) {
    return Scripts.createScript(doc);
  },

  /**
   * Update script
   */
  scriptsEdit(_root, { _id, ...fields }: IScriptsEdit) {
    return Scripts.updateScript(_id, fields);
  },

  /**
   * Delete script
   */
  scriptsRemove(_root, { _id }: { _id: string }) {
    return Scripts.removeScript(_id);
  },
};

moduleRequireLogin(scriptMutations);

export default scriptMutations;
