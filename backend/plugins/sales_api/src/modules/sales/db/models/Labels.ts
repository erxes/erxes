import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IDealDocument,
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
  validateUniqueness(filter: IFilter, _id?: string): Promise<boolean>;
  labelObject(params: ILabelObjectParams): Promise<{oldDeal: IDealDocument, deal: IDealDocument}>;
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

    public static async labelObject({ labelIds, dealId }: ILabelObjectParams) {
      const oldDeal = await models.Deals.getDeal(dealId);
      const existingCount = await models.PipelineLabels.countDocuments({
        _id: { $in: labelIds },
      });

      if (existingCount !== labelIds.length) {
        throw new Error('Label not found');
      }

      const deal = await models.Deals.updateDeal(dealId, { labelIds, stageId: oldDeal.stageId });

      return { oldDeal, deal }
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

      return pipelineLabel;
    }

    public static async updatePipelineLabel(_id: string, doc: IPipelineLabel, userId?: string) {
      const prevLabel = await models.PipelineLabels.findOne({ _id });
      if (!prevLabel) throw new Error('Label not found');

      const isUnique = await models.PipelineLabels.validateUniqueness(
        {
          name: doc.name,
          pipelineId: doc.pipelineId,
          colorCode: doc.colorCode,
        },
        _id,
      );

      if (!isUnique) throw new Error('Label duplicated');

      await models.PipelineLabels.updateOne(
        { _id },
        { $set: { ...doc, userId } },
      );

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

      sendDbEventLog?.({
        action: 'delete',
        docId: pipelineLabel._id,
      });

      await models.Deals.updateMany(
        { labelIds: pipelineLabel._id },
        { $pull: { labelIds: pipelineLabel._id } },
      );

      await pipelineLabel.deleteOne();
      return pipelineLabel;
    }
  }

  pipelineLabelSchema.loadClass(PipelineLabel);
  return pipelineLabelSchema;
};