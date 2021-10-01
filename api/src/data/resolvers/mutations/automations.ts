import { Segments } from '../../../db/models';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IAutomation {
  name: string;
  status: string;
  actions?: any[];
  triggers?: any[];
}

interface IAutomationNote {
  description?: string;
  createdAt?: Date;
  createdBy?: string;
}

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
      docModifier({ ...doc, createdBy: user._id, updatedBy: user._id })
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
      ...doc,
      updatedBy: user._id
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
    { _id, name }: { _id: string; name: string },
    { user, dataSources }: IContext
  ) {
    const automation = await dataSources.AutomationsAPI.getAutomationDetail(
      _id
    );

    delete automation._id;
    automation.status = 'template';
    automation.name = name;

    const created = await dataSources.AutomationsAPI.createAutomation(
      automation
    );

    await putUpdateLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        object: created,
        newData: automation
      },
      user
    );

    return created;
  },

  /**
   * Save as a template
   */
  async automationsCreateFromTemplate(
    _root,
    { _id }: { _id: string },
    { user, dataSources }: IContext
  ) {
    const automation = await dataSources.AutomationsAPI.getAutomationDetail(
      _id
    );

    if (automation.status !== 'template') {
      throw new Error('Not template');
    }

    delete automation._id;
    automation.status = 'active';
    automation.name += ' from template';

    const created = await dataSources.AutomationsAPI.createAutomation(
      automation
    );

    await putCreateLog(
      {
        type: MODULE_NAMES.AUTOMATION,
        newData: automation,
        object: created
      },
      user
    );

    return created;
  },

  /**
   * Removes automations
   */
  async automationsRemove(
    _root,
    { automationIds }: { automationIds: string[] },
    { dataSources }: IContext
  ) {
    const data = await dataSources.AutomationsAPI.removeAutomations(
      automationIds
    );

    const { segmentIds } = data;

    for (const segmentId of segmentIds || []) {
      await Segments.removeSegment(segmentId);
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

    if (!note) {
      throw new Error('Note not found');
    }

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
    { _id }: { _id: string },
    { user, dataSources }: IContext
  ) {
    const note = await dataSources.AutomationsAPI.getAutomationNote({ _id });

    if (!note) {
      throw new Error('Note not found');
    }

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
