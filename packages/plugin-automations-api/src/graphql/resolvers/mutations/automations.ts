import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  IAutomation,
  IAutomationDoc
} from '../../../models/definitions/automaions';
import { INote } from '../../../models/definitions/notes';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../../logUtils';
import { sendSegmentsMessage } from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';

interface IAutomationNoteEdit extends INote {
  _id: string;
}

interface IAutomationsEdit extends IAutomation {
  _id: string;
}

const automationMutations = _serviceDiscovery => ({
  /**
   * Creates a new automation
   */
  async automationsAdd(
    _root,
    doc: IAutomation,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const automation = await models.Automations.create({
      ...docModifier({ ...doc }),
      createdAt: new Date(),
      createdBy: user._id,
      updatedBy: user._id
    });

    await putCreateLog(
      subdomain,
      {
        type: 'automation',
        newData: doc,
        object: automation
      },
      user
    );

    return models.Automations.getAutomation(automation._id);
  },

  /**
   * Updates a automation
   */
  async automationsEdit(
    _root,
    { _id, ...doc }: IAutomationsEdit,
    { user, models, subdomain }: IContext
  ) {
    const automation = await models.Automations.getAutomation(_id);

    const updated = await models.Automations.updateOne(
      { _id },
      { $set: { ...doc, updatedAt: new Date(), updatedBy: user._id } }
    );

    await putUpdateLog(
      subdomain,
      {
        type: 'automation',
        object: automation,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return models.Automations.getAutomation(_id);
  },

  /**
   * Save as a template
   */
  async automationsSaveAsTemplate(
    _root,
    { _id, name }: { _id: string; name: string },
    { user, models, subdomain }: IContext
  ) {
    const automation = await models.Automations.getAutomation(_id);

    const automationDoc: IAutomationDoc = {
      ...automation,
      status: 'template',
      name,
      createdAt: new Date(),
      createdBy: user._id,
      updatedBy: user._id
    };

    delete automationDoc._id;

    const created = await models.Automations.create({
      ...automationDoc
    });

    await putUpdateLog(
      subdomain,
      {
        type: 'automation',
        object: created,
        newData: automation
      },
      user
    );

    return await models.Automations.getAutomation(created._id);
  },

  /**
   * Save as a template
   */
  async automationsCreateFromTemplate(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const automation = await models.Automations.getAutomation(_id);

    if (automation.status !== 'template') {
      throw new Error('Not template');
    }

    const automationDoc: IAutomationDoc = {
      ...automation,
      status: 'template',
      name: automation.name += ' from template',
      createdAt: new Date(),
      createdBy: user._id,
      updatedBy: user._id
    };

    delete automationDoc._id;

    const created = await models.Automations.create({
      ...automationDoc
    });

    await putCreateLog(
      subdomain,
      {
        type: 'automation',
        newData: automation,
        object: created
      },
      user
    );

    return await models.Automations.getAutomation(created._id);
  },

  /**
   * Removes automations
   */
  async automationsRemove(
    _root,
    { automationIds }: { automationIds: string[] },
    { models }: IContext
  ) {
    const automations = await models.Automations.find({
      _id: { $in: automationIds }
    });

    let segmentIds: string[] = [];

    for (const automation of automations) {
      const { triggers, actions } = automation;

      const triggerIds = triggers.map(trigger => {
        return trigger.config.contentId;
      });

      const actionIds = actions.map(action => {
        return action.config.contentId;
      });

      segmentIds = [...triggerIds, ...actionIds];
    }

    await models.Automations.deleteMany({ _id: { $in: automationIds } });
    await models.Executions.removeExecutions(automationIds);

    for (const segmentId of segmentIds || []) {
      sendSegmentsMessage({
        subdomain: '',
        action: 'removeSegment',
        data: { segmentId }
      });
    }

    return automationIds;
  },

  /**
   * Add note
   */
  async automationsAddNote(
    _root,
    doc: INote,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const noteDoc = { ...doc, createdBy: user._id };

    const note = await models.Notes.createNote(docModifier(noteDoc));

    await putUpdateLog(
      subdomain,
      {
        type: 'automation',
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
    { user, docModifier, dataSources, models, subdomain }: IContext
  ) {
    const note = await dataSources.AutomationsAPI.getAutomationNote({ _id });

    if (!note) {
      throw new Error('Note not found');
    }

    const noteDoc = { ...doc, updatedBy: user._id };

    const updated = await models.Notes.updateNote(_id, docModifier(noteDoc));

    await putUpdateLog(
      subdomain,
      {
        type: 'automation',
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
    { user, models, subdomain }: IContext
  ) {
    const note = await models.Notes.getNote(_id);

    await models.Notes.deleteOne({ _id });

    await putDeleteLog(
      subdomain,
      {
        type: 'automation',
        object: note
      },
      user
    );

    return note;
  }
});

checkPermission(automationMutations, 'automationsAdd', 'automationsAdd');
checkPermission(automationMutations, 'automationsEdit', 'automationsEdit');
checkPermission(automationMutations, 'automationsRemove', 'automationsRemove');

export default automationMutations;
