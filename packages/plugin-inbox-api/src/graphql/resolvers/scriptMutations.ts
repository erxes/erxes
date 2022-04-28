import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { IScript } from '../../models/definitions/scripts';

interface IScriptsEdit extends IScript {
  _id: string;
}

const scriptMutations = {
  /**
   * Creates a new script
   */
  async scriptsAdd(_root, doc: IScript, { user, docModifier, models, subdomain }: IContext) {
    const modifiedDoc = docModifier(doc);
    const script = await models.Scripts.createScript(modifiedDoc);

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.SCRIPT,
        newData: modifiedDoc,
        object: script
      },
      user
    );

    return script;
  },

  /**
   * Updates a script
   */
  async scriptsEdit(
    _root,
    { _id, ...fields }: IScriptsEdit,
    { user, models, subdomain }: IContext
  ) {
    const script = await models.Scripts.getScript(_id);
    const updated = await models.Scripts.updateScript(_id, fields);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.SCRIPT,
        object: script,
        newData: fields,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Deletes a script
   */
  async scriptsRemove(_root, { _id }: { _id: string }, { user, models, subdomain }: IContext) {
    const script = await models.Scripts.getScript(_id);
    const removed = await models.Scripts.removeScript(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.SCRIPT, object: script },
      user
    );

    return removed;
  }
};

moduleCheckPermission(scriptMutations, 'manageScripts');

export default scriptMutations;
