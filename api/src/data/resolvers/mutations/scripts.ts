import { Scripts } from '../../../db/models';
import { IScript } from '../../../db/models/definitions/scripts';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IScriptsEdit extends IScript {
  _id: string;
}

const scriptMutations = {
  /**
   * Creates a new script
   */
  async scriptsAdd(_root, doc: IScript, { user, docModifier }: IContext) {
    const modifiedDoc = docModifier(doc);
    const script = await Scripts.createScript(modifiedDoc);

    await putCreateLog(
      {
        type: MODULE_NAMES.SCRIPT,
        newData: modifiedDoc,
        object: script,
      },
      user,
    );

    return script;
  },

  /**
   * Updates a script
   */
  async scriptsEdit(_root, { _id, ...fields }: IScriptsEdit, { user }: IContext) {
    const script = await Scripts.getScript(_id);
    const updated = await Scripts.updateScript(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.SCRIPT,
        object: script,
        newData: fields,
        updatedDocument: updated,
      },
      user,
    );

    return updated;
  },

  /**
   * Deletes a script
   */
  async scriptsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const script = await Scripts.getScript(_id);
    const removed = await Scripts.removeScript(_id);

    await putDeleteLog({ type: MODULE_NAMES.SCRIPT, object: script }, user);

    return removed;
  },
};

moduleCheckPermission(scriptMutations, 'manageScripts');

export default scriptMutations;
