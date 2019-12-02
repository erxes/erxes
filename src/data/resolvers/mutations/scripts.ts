import { Scripts } from '../../../db/models';
import { IScript } from '../../../db/models/definitions/scripts';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IScriptsEdit extends IScript {
  _id: string;
}

const scriptMutations = {
  /**
   * Create new script
   */
  async scriptsAdd(_root, doc: IScript, { user, docModifier }: IContext) {
    const script = await Scripts.createScript(docModifier(doc));

    await putCreateLog(
      {
        type: 'script',
        newData: JSON.stringify(doc),
        object: script,
        description: `${script.name} has been created`,
      },
      user,
    );

    return script;
  },

  /**
   * Update script
   */
  async scriptsEdit(_root, { _id, ...fields }: IScriptsEdit, { user }: IContext) {
    const script = await Scripts.getScript(_id);
    const updated = await Scripts.updateScript(_id, fields);

    await putUpdateLog(
      {
        type: 'script',
        object: script,
        newData: JSON.stringify(fields),
        description: `${script.name} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Delete script
   */
  async scriptsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const script = await Scripts.getScript(_id);
    const removed = await Scripts.removeScript(_id);

    await putDeleteLog(
      {
        type: 'script',
        object: script,
        description: `${script.name} has been removed`,
      },
      user,
    );

    return removed;
  },
};

moduleCheckPermission(scriptMutations, 'manageScripts');

export default scriptMutations;
