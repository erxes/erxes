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
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class PipelineLabel {
    public static async getPipelineLabel(_id: string) {
      const pipelineLabel = await models.PipelineLabels.findOne({ _id });

      if (!pipelineLabel) {
        throw new Error('Label not found');
      }

      return pipelineLabel;
    }

    /*
     * Validates label uniqueness
     */
    public static async validateUniqueness(
      filter: IFilter,
      _id?: string,
    ): Promise<boolean> {
      if (_id) {
        filter._id = { $ne: _id };
      }

      if (await models.PipelineLabels.findOne(filter)) {
        return false;
      }

      return true;
    }

    /*
     * Common helper for objects like deal and growth hack etc ...
     */
    public static async labelObject({
      labelIds,
      targetId,
      collection,
    }: ILabelObjectParams) {
      const prevLabelsCount = await models.PipelineLabels.find({
        _id: { $in: labelIds },
      }).countDocuments();

      if (prevLabelsCount !== labelIds.length) {
        throw new Error('Label not found');
      }

      await collection.updateMany(
        { _id: targetId },
        { $set: { labelIds } },
        { multi: true },
      );
    }

    /**
     * Create a pipeline label
     */
    public static async createPipelineLabel(
      doc: IPipelineLabel,
      userId?: string,
    ) {
      const filter: IFilter = {
        name: doc.name,
        pipelineId: doc.pipelineId,
        colorCode: doc.colorCode,
      };

      const isUnique = await models.PipelineLabels.validateUniqueness(filter);

      if (!isUnique) {
        throw new Error('Label duplicated');
      }

      const pipelineLabel = await models.PipelineLabels.create({
        ...doc,
        userId,
      });

      // Send database event log
      sendDbEventLog({
        action: 'create',
        docId: pipelineLabel._id,
        currentDocument: pipelineLabel.toObject(),
      });

      // Create activity log
      createActivityLog({
        activityType: 'create',
        target: {
          _id: pipelineLabel._id,
          moduleName: 'sales',
          collectionName: 'pipelineLabels',
        },
        action: {
          type: 'create',
          description: 'Pipeline label created',
        },
        changes: {
          name: pipelineLabel.name,
          colorCode: pipelineLabel.colorCode,
          pipelineId: pipelineLabel.pipelineId,
          createdAt: new Date(),
        },
        metadata: {
          pipelineId: pipelineLabel.pipelineId,
          userId,
        },
      });

      return pipelineLabel;
    }

    /**
     * Update pipeline label
     */
    public static async updatePipelineLabel(
      _id: string,
      doc: IPipelineLabel,
      userId?: string,
    ) {
      const prevLabel = await models.PipelineLabels.findOne({ _id });

      if (!prevLabel) {
        throw new Error('Label not found');
      }

      const isUnique = await models.PipelineLabels.validateUniqueness(
        { ...doc },
        _id,
      );

      if (!isUnique) {
        throw new Error('Label duplicated');
      }

      await models.PipelineLabels.updateOne(
        { _id },
        { $set: { ...doc, userId } },
      );

      const updatedLabel = await models.PipelineLabels.findOne({ _id });

      if (updatedLabel) {
        // Send database event log
        sendDbEventLog({
          action: 'update',
          docId: updatedLabel._id,
          currentDocument: updatedLabel.toObject(),
          prevDocument: prevLabel.toObject(),
        });

        // Generate activity logs for changed fields
        await generatePipelineLabelActivityLogs(
          prevLabel.toObject(),
          updatedLabel.toObject(),
          models,
          createActivityLog,
        );
      }

      return updatedLabel;
    }

    /**
     * Remove pipeline label
     */
    public static async removePipelineLabel(_id: string) {
      const pipelineLabel = await models.PipelineLabels.findOne({ _id });

      if (!pipelineLabel) {
        throw new Error('Label not found');
      }

      // Send database event log before deletion
      sendDbEventLog({
        action: 'delete',
        docId: pipelineLabel._id,
      });

      // Create activity log
      createActivityLog({
        activityType: 'delete',
        target: {
          _id: pipelineLabel._id,
          moduleName: 'sales',
          collectionName: 'pipelineLabels',
        },
        action: {
          type: 'delete',
          description: 'Pipeline label deleted',
        },
        changes: {
          name: pipelineLabel.name,
          colorCode: pipelineLabel.colorCode,
          deletedAt: new Date(),
        },
        metadata: {
          pipelineId: pipelineLabel.pipelineId,
          userId: pipelineLabel.userId,
        },
      });

      // delete labelId from collection that used labelId
      await models.Deals.updateMany(
        { labelIds: { $in: [pipelineLabel._id] } },
        { $pull: { labelIds: pipelineLabel._id } },
      );

      await pipelineLabel.deleteOne();

      return pipelineLabel;
    }

    /**
     * Attach a label
     */
    public static async labelsLabel(targetId: string, labelIds: string[]) {
      await models.PipelineLabels.labelObject({
        labelIds,
        targetId,
        collection: models.Deals,
      });
    }
  }

  pipelineLabelSchema.loadClass(PipelineLabel);

  return pipelineLabelSchema;
};