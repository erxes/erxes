import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ILabelObjectParams,
  IPipelineLabel,
  IPipelineLabelDocument,
} from '../../@types';
import { pipelineLabelSchema } from '../definitions/labels';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { generatePipelineLabelActivityLogs } from '~/utils/activityLogs';

interface IFilter extends IPipelineLabel {
  _id?: any;
}

export interface IPipelineLabelModel extends Model<IPipelineLabelDocument> {
  getPipelineLabel(_id: string): Promise<IPipelineLabelDocument>;
  createPipelineLabel(
    doc: IPipelineLabel,
    userId?: string,
  ): Promise<IPipelineLabelDocument>;
  updatePipelineLabel(
    _id: string,
    doc: IPipelineLabel,
    userId?: string,
  ): Promise<IPipelineLabelDocument>;
  removePipelineLabel(_id: string): Promise<IPipelineLabelDocument>;
  labelsLabel(targetId: string, labelIds: string[]): void;
  validateUniqueness(filter: IFilter, _id?: string): Promise<boolean>;
  labelObject(params: ILabelObjectParams): void;
}

export const loadPipelineLabelClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog, createActivityLog } = dispatcher;

  class PipelineLabel {
    public static async getPipelineLabel(_id: string) {
      const pipelineLabel = await models.PipelineLabels.findOne({ _id });
      if (!pipelineLabel) throw new Error('Label not found');
      return pipelineLabel;
    }

    public static async validateUniqueness(filter: IFilter, _id?: string): Promise<boolean> {
      if (_id) filter._id = { $ne: _id };
      return !(await models.PipelineLabels.findOne(filter));
    }

    public static async labelObject({ labelIds, targetId, collection }: ILabelObjectParams) {
      const existingCount = await models.PipelineLabels.find({ _id: { $in: labelIds } }).countDocuments();
      if (existingCount !== labelIds.length) throw new Error('Label not found');

      await collection.updateMany({ _id: targetId }, { $set: { labelIds } }, { multi: true });
    }

    public static async createPipelineLabel(doc: IPipelineLabel, userId?: string) {
      const isUnique = await models.PipelineLabels.validateUniqueness({
        name: doc.name,
        pipelineId: doc.pipelineId,
        colorCode: doc.colorCode,
      });

      if (!isUnique) throw new Error('Label duplicated');

      const pipelineLabel = await models.PipelineLabels.create({ ...doc, userId });

      sendDbEventLog?.({
        action: 'create',
        docId: pipelineLabel._id,
        currentDocument: pipelineLabel.toObject(),
      });

      createActivityLog?.({
        activityType: 'create',
        target: { _id: pipelineLabel._id, moduleName: 'sales', collectionName: 'pipelineLabels' },
        action: { type: 'create', description: 'Pipeline label created' },
        changes: {
          name: pipelineLabel.name,
          colorCode: pipelineLabel.colorCode,
          pipelineId: pipelineLabel.pipelineId,
          createdAt: new Date(),
        },
        metadata: { pipelineId: pipelineLabel.pipelineId, userId },
      });

      return pipelineLabel;
    }

    public static async updatePipelineLabel(_id: string, doc: IPipelineLabel, userId?: string) {
      const prevLabel = await models.PipelineLabels.findOne({ _id });
      if (!prevLabel) throw new Error('Label not found');

      const isUnique = await models.PipelineLabels.validateUniqueness(doc, _id);
      if (!isUnique) throw new Error('Label duplicated');

      await models.PipelineLabels.updateOne({ _id }, { $set: { ...doc, userId } });

      const updatedLabel = await models.PipelineLabels.findOne({ _id });
      if (!updatedLabel) throw new Error('Label not found after update');

      sendDbEventLog?.({
        action: 'update',
        docId: updatedLabel._id,
        currentDocument: updatedLabel.toObject(),
        prevDocument: prevLabel.toObject(),
      });

      await generatePipelineLabelActivityLogs(
        prevLabel.toObject(),
        updatedLabel.toObject(),
        models,
        createActivityLog,
      );

      return updatedLabel;
    }

    public static async removePipelineLabel(_id: string) {
      const pipelineLabel = await models.PipelineLabels.findOne({ _id });
      if (!pipelineLabel) throw new Error('Label not found');

      sendDbEventLog?.({ action: 'delete', docId: pipelineLabel._id });

      createActivityLog?.({
        activityType: 'delete',
        target: { _id: pipelineLabel._id, moduleName: 'sales', collectionName: 'pipelineLabels' },
        action: { type: 'delete', description: 'Pipeline label deleted' },
        changes: {
          name: pipelineLabel.name,
          colorCode: pipelineLabel.colorCode,
          deletedAt: new Date(),
        },
        metadata: { pipelineId: pipelineLabel.pipelineId, userId: pipelineLabel.userId },
      });

      // Remove label from Deals
      await models.Deals.updateMany(
        { labelIds: { $in: [pipelineLabel._id] } },
        { $pull: { labelIds: pipelineLabel._id } },
      );

      await pipelineLabel.deleteOne();
      return pipelineLabel;
    }

    public static async labelsLabel(targetId: string, labelIds: string[]) {
      await models.PipelineLabels.labelObject({ labelIds, targetId, collection: models.Deals });
    }
  }

  pipelineLabelSchema.loadClass(PipelineLabel);
  return pipelineLabelSchema;
};