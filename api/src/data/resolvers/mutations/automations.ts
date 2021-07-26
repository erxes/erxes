import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IAutomation {
  name;
}

interface IAutomationsEdit extends IAutomation {
  _id: string;
}

const automationMutations = {
  /**
   * Creates a new automation
   */
  async automationsAdd(
    _root,
    doc: IAutomation,
    { user, docModifier, dataSources }: IContext
  ) {
    const automation = await dataSources.AutomationsAPI.createAutomation(
      docModifier(doc)
    );

    await putCreateLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        newData: doc,
        object: automation
      },
      user
    );

    return automation;
  },

  /**
   * Updates a automation
   */
  async automationsEdit(
    _root,
    { _id, ...doc }: IAutomationsEdit,
    { user, dataSources }: IContext
  ) {
    const automation = await dataSources.AutomationsAPI.getAutomationDetail(
      _id
    );
    const updated = await dataSources.AutomationsAPI.updateAutomation({
      _id,
      ...doc
    });

    await putUpdateLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        object: automation,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes automations
   */
  async automationsRemove(
    _root,
    { automationIds }: { automationIds: string[] },
    { user, dataSources }: IContext
  ) {
    const automations = await dataSources.AutomationsAPI.getAutomations({
      _id: { $in: automationIds }
    });

    await dataSources.AutomationsAPI.removeAutomations(automationIds);

    for (const automation of automations) {
      await putDeleteLog(
        { type: MODULE_NAMES.AUTOMATION, object: automation },
        user
      );
    }

    return automationIds;
  }
};

checkPermission(automationMutations, 'automationsAdd', 'automationsAdd');
checkPermission(automationMutations, 'automationsEdit', 'automationsEdit');
checkPermission(automationMutations, 'automationsRemove', 'automationsRemove');

export default automationMutations;
