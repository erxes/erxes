import {
  AUTOMATION_STATUSES,
  automationSchema,
  EventDispatcherReturn,
  IAutomation,
  IAutomationDocument,
  validateWorkflowBindings,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  requestScheduleReconcile,
  resumeHeldExecutions,
} from '../../utils/service';
import {
  buildDuplicatedAutomation,
  generateDuplicateName,
  hasFlowChanged,
} from './utils/duplicateAutomation';

export type TAutomationEdit = IAutomation & { acknowledgeDuplicate?: boolean };

export interface IAutomationModel extends Model<IAutomationDocument> {
  getAutomation(_id: string): Promise<IAutomationDocument>;
  createAutomation(
    doc: IAutomation,
    userId: string,
  ): Promise<IAutomationDocument>;
  editAutomation(
    _id: string,
    doc: TAutomationEdit,
    userId: string,
  ): Promise<IAutomationDocument>;
  archiveAutomations(_ids: string[], isRestore: boolean): Promise<string[]>;
  removeAutomations(_ids: string[]): Promise<string[]>;
  duplicateAutomation(
    _id: string,
    userId: string,
    name?: string,
  ): Promise<IAutomationDocument>;
  setOwner(_id: string, ownerId: string): Promise<IAutomationDocument>;
}

export const loadClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class Automation {
    public static async getAutomation(_id) {
      return await models.Automations.findOne({ _id }).lean();
    }

    public static async createAutomation(doc: IAutomation, userId: string) {
      // Creating it already live is the same act as activating it, so the
      // same person takes it on.
      const bornRunning = doc.status === AUTOMATION_STATUSES.ACTIVE;
      const now = new Date();

      const created = await models.Automations.create({
        ...doc,
        createdAt: now,
        createdBy: userId,
        updatedBy: userId,
        ...(bornRunning && {
          ownerId: userId,
          activatedBy: userId,
          activatedAt: now,
        }),
      });

      sendDbEventLog({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      await requestScheduleReconcile(subdomain);

      return models.Automations.getAutomation(created._id);
    }

    public static async editAutomation(
      _id: string,
      doc: TAutomationEdit,
      userId: string,
    ) {
      const { acknowledgeDuplicate, ...changes } = doc;
      const automation = await models.Automations.getAutomation(_id);

      if (!automation) {
        throw new Error('Automation not found');
      }

      const nextStatus = changes.status ?? automation.status;
      const isActivating = nextStatus === AUTOMATION_STATUSES.ACTIVE;

      // An active automation must not carry bindings that cannot resolve.
      if (isActivating) {
        const bindingErrors = validateWorkflowBindings(
          changes.workflows ?? automation.workflows,
          changes.actions ?? automation.actions,
        );

        if (bindingErrors.length) {
          throw new Error(
            `Cannot activate automation: ${bindingErrors.join('; ')}`,
          );
        }
      }

      const isUntouchedDuplicate =
        !!automation.duplicatedFrom && !hasFlowChanged(automation, changes);

      if (isActivating && isUntouchedDuplicate && !acknowledgeDuplicate) {
        throw new Error(
          'This automation is an unchanged duplicate and would run the same flow twice on the same triggers. Change it first, or confirm the activation.',
        );
      }

      const shouldClearDuplicatedFrom =
        !!automation.duplicatedFrom &&
        (!isUntouchedDuplicate || !!acknowledgeDuplicate);

      // Flipping the switch is not editing the flow. Stamping `updatedBy` for
      // it used to hand the automation's authorship — and every record it goes
      // on to create — to whoever last toggled it.
      const isStatusOnly =
        Object.keys(changes).length === 1 && changes.status !== undefined;

      const startedRunning =
        isActivating && automation.status !== AUTOMATION_STATUSES.ACTIVE;

      const updated = await models.Automations.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...changes,
            updatedAt: new Date(),
            ...(isStatusOnly ? {} : { updatedBy: userId }),
            ...(startedRunning && {
              activatedBy: userId,
              activatedAt: new Date(),
              // Taken, never given: putting an automation live is answering
              // for what it does, and the first person to do so is its owner
              // until someone else accepts it from them.
              ...(automation.ownerId ? {} : { ownerId: userId }),
            }),
          },
          ...(shouldClearDuplicatedFrom && { $unset: { duplicatedFrom: '' } }),
        },
        { new: true },
      );

      if (!updated) {
        throw new Error('Automation not found');
      }

      sendDbEventLog({
        action: 'update',
        docId: _id,
        prevDocument: automation,
        currentDocument: updated.toObject(),
      });

      await requestScheduleReconcile(subdomain);

      // Coming back from a pause: the delays that came due meanwhile are held
      // by the automations service until it is told to arm them.
      if (isActivating && automation.status !== AUTOMATION_STATUSES.ACTIVE) {
        await resumeHeldExecutions(subdomain, _id);
      }

      return models.Automations.getAutomation(_id);
    }

    public static async archiveAutomations(_ids: string[], isRestore: boolean) {
      await models.Automations.updateMany(
        { _id: { $in: _ids } },
        {
          $set: {
            status: isRestore
              ? AUTOMATION_STATUSES.DRAFT
              : AUTOMATION_STATUSES.ARCHIVED,
          },
        },
      );

      sendDbEventLog({
        action: 'updateMany',
        docIds: _ids,
        updateDescription: { isRestore },
      });

      await requestScheduleReconcile(subdomain);

      return _ids;
    }

    public static async removeAutomations(_ids: string[]) {
      const automations = await models.Automations.find({
        _id: { $in: _ids },
      }).lean();

      // Segments an automation made for itself go with it.
      const segmentIds = automations.flatMap(({ triggers, actions }) => [
        ...triggers.map((trigger) => trigger.config?.contentId),
        ...actions.map((action) => action.config?.contentId),
      ]);

      await models.Automations.deleteMany({ _id: { $in: _ids } });

      sendDbEventLog({ action: 'deleteMany', docIds: _ids });

      await models.AutomationExecutions.removeExecutions(_ids);

      await models.Segments.deleteMany({
        _id: { $in: segmentIds.filter(Boolean) },
        ownedBy: 'automation',
      });

      await requestScheduleReconcile(subdomain);

      return _ids;
    }

    /**
     * Moves ownership. Taken by activating it, or handed over through an
     * approved change — never assigned to someone who did not agree, so the
     * caller is responsible for having that agreement.
     */
    public static async setOwner(_id: string, ownerId: string) {
      const automation = await models.Automations.getAutomation(_id);

      if (!automation) {
        throw new Error('Automation not found');
      }

      const updated = await models.Automations.findOneAndUpdate(
        { _id },
        { $set: { ownerId } },
        { new: true },
      );

      if (!updated) {
        throw new Error('Automation not found');
      }

      sendDbEventLog({
        action: 'update',
        docId: _id,
        prevDocument: automation,
        currentDocument: updated.toObject(),
      });

      return updated;
    }

    public static async duplicateAutomation(
      _id: string,
      userId: string,
      name?: string,
    ) {
      const automation = await models.Automations.getAutomation(_id);

      if (!automation) {
        throw new Error('Automation not found');
      }

      const duplicated = await buildDuplicatedAutomation(
        models,
        automation,
        userId,
      );
      const now = new Date();

      const copy = await models.Automations.create({
        ...duplicated,
        name:
          name?.trim() ||
          (await generateDuplicateName(models, automation.name)),
        status: AUTOMATION_STATUSES.DRAFT,
        duplicatedFrom: _id,
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId,
      });

      sendDbEventLog({
        action: 'create',
        docId: copy._id,
        currentDocument: copy.toObject(),
      });

      await requestScheduleReconcile(subdomain);

      return models.Automations.getAutomation(copy._id);
    }
  }

  automationSchema.loadClass(Automation);

  return automationSchema;
};
