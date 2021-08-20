import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IAutomation {
  name: string;
  status: string;
}

interface IAutomationNote {}

interface IAutomationNoteEdit extends IAutomationNote {
  _id: string;
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
   * Save as a template
   */
  async automationsSaveAsTemplate(
    _root,
    doc: IAutomation,
    { user, docModifier, dataSources }: IContext
  ) {
    doc.status = 'template';

    const automation = await dataSources.AutomationsAPI.createAutomation(
      docModifier(doc)
    );

    await putUpdateLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        object: automation,
        newData: doc
      },
      user
    );

    return automation;
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
  },

  /**
   * Add note
   */
  async automationsAddNote(
    _root,
    doc: IAutomationNote,
    { user, docModifier, dataSources }: IContext
  ) {
    const noteDoc = { ...doc, createdBy: user._id };

    const note = await dataSources.AutomationsAPI.createAutomationNote(
      docModifier(noteDoc)
    );

    await putUpdateLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        object: note,
        newData: noteDoc
      },
      user
    );

    return note;
  },

  /**
   * Edit note
   */
  async automationsEditNote(
    _root,
    { _id, ...doc }: IAutomationNoteEdit,
    { user, docModifier, dataSources }: IContext
  ) {
    const note = await dataSources.AutomationsAPI.getAutomationNote({ _id });

    const noteDoc = { ...doc, updatedBy: user._id };

    const updated = await dataSources.AutomationsAPI.updateAutomationNote(
      _id,
      docModifier(noteDoc)
    );

    await putUpdateLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        object: note,
        newData: noteDoc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Remove note
   */
  async automationsRemoveNote(
    _root,
    { _id }: { _id: String },
    { user, dataSources }: IContext
  ) {
    const note = await dataSources.AutomationsAPI.getAutomationNote({ _id });

    console.log('note: ', note);

    await dataSources.AutomationsAPI.removeAutomationNote(_id);

    await putDeleteLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        object: note
      },
      user
    );

    return note;
  }
};

checkPermission(automationMutations, 'automationsAdd', 'automationsAdd');
checkPermission(automationMutations, 'automationsEdit', 'automationsEdit');
checkPermission(automationMutations, 'automationsRemove', 'automationsRemove');

export default automationMutations;
