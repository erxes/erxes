import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { IFxaInstance, IFxaInstanceDocument } from '../../@types/fxaInstance';
import { FXA_INSTANCE_STATUSES } from '../../@types/constants';
import { fxaInstanceSchema } from '../definitions/fxaInstance';

type TFxaSequenceAsset = {
  _id: string;
  code?: string;
};

type TFxaSequenceState = {
  maxSequences: Map<string, number>;
  usedSequences: Map<string, Set<number>>;
};

type TFxaIncomeInstanceMatch = Pick<
  IFxaInstanceDocument,
  '_id' | 'fixedAssetId' | 'code' | 'sequence'
> & {
  transactionDetailId?: string;
};

type TFxaMovementBucketParams = {
  sourceInstance: IFxaInstanceDocument;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  userId: string;
};

export interface IFxaInstanceModel extends Model<IFxaInstanceDocument> {
  getCodeSequence(code: string, fixedAssetCode: string): number;
  getSequenceState(
    fixedAssets: TFxaSequenceAsset[],
  ): Promise<TFxaSequenceState>;
  findIncomeInstances(
    instanceIds: string[],
  ): Promise<TFxaIncomeInstanceMatch[]>;
  removeByIds(instanceIds: string[]): Promise<void>;
  findByIds(instanceIds: string[]): Promise<IFxaInstanceDocument[]>;
  listByFilter(
    filter: Record<string, unknown>,
  ): Promise<IFxaInstanceDocument[]>;
  findAdjustable(params: {
    status: string;
    endDate: Date;
  }): Promise<IFxaInstanceDocument[]>;
  upsertIncomeInstance(params: {
    _id?: string;
    doc: IFxaInstance;
    userId: string;
  }): Promise<IFxaInstanceDocument | null>;
  findOrCreateMovementBucket(
    params: TFxaMovementBucketParams,
  ): Promise<IFxaInstanceDocument>;
}

const normalizeBucketValue = (value?: string) => value || '';

export const loadFxaInstanceClass = () => {
  class FxaInstance {
    public static getCodeSequence(
      this: IFxaInstanceModel,
      code: string,
      fixedAssetCode: string,
    ) {
      const escapedCode = fixedAssetCode.replace(
        /[.*+?^${}()|[\]\\]/g,
        String.raw`\$&`,
      );
      const match = new RegExp(String.raw`^${escapedCode}_(\d+)$`).exec(code);

      return match ? Number(match[1]) : 0;
    }

    public static async getSequenceState(
      this: IFxaInstanceModel,
      fixedAssets: TFxaSequenceAsset[],
    ) {
      const maxSequences = new Map<string, number>();
      const usedSequences = new Map<string, Set<number>>();

      for (const fixedAsset of fixedAssets) {
        const selector: Record<string, unknown> = {
          fixedAssetId: fixedAsset._id,
        };

        const instances = await this.find(selector)
          .select({ code: 1, sequence: 1 })
          .lean();
        const used = new Set<number>();
        let maxSequence = 0;

        for (const instance of instances) {
          const sequence = Math.max(
            instance.sequence || 0,
            fixedAsset.code
              ? this.getCodeSequence(instance.code || '', fixedAsset.code)
              : 0,
            this.getCodeSequence(instance.code || '', fixedAsset._id),
          );

          if (sequence > 0) {
            used.add(sequence);
            maxSequence = Math.max(maxSequence, sequence);
          }
        }

        usedSequences.set(fixedAsset._id, used);
        maxSequences.set(fixedAsset._id, maxSequence);
      }

      return { maxSequences, usedSequences };
    }

    public static async findIncomeInstances(
      this: IFxaInstanceModel,
      instanceIds: string[],
    ) {
      if (!instanceIds.length) {
        return [];
      }

      return this.find({ _id: { $in: instanceIds } })
        .sort({ fixedAssetId: 1, transactionDetailId: 1, sequence: 1, code: 1 })
        .select({
          _id: 1,
          fixedAssetId: 1,
          code: 1,
          sequence: 1,
          transactionDetailId: 1,
        })
        .lean();
    }

    public static async removeByIds(
      this: IFxaInstanceModel,
      instanceIds: string[],
    ) {
      if (!instanceIds.length) {
        return;
      }

      await this.deleteMany({ _id: { $in: instanceIds } });
    }

    public static async findByIds(
      this: IFxaInstanceModel,
      instanceIds: string[],
    ) {
      return this.find({ _id: { $in: instanceIds } }).lean();
    }

    public static async listByFilter(
      this: IFxaInstanceModel,
      filter: Record<string, unknown>,
    ) {
      return this.find(filter).sort({ fixedAssetId: 1, code: 1 }).lean();
    }

    public static async findAdjustable(
      this: IFxaInstanceModel,
      { status, endDate }: { status: string; endDate: Date },
    ) {
      return this.find({
        $or: [
          { currentStatus: status },
          { currentStatus: { $exists: false }, status },
        ],
        acquisitionDate: { $lte: endDate },
      }).lean();
    }

    public static async upsertIncomeInstance(
      this: IFxaInstanceModel,
      {
        _id,
        doc,
        userId,
      }: {
        _id?: string;
        doc: IFxaInstance;
        userId: string;
      },
    ) {
      if (_id) {
        return this.findOneAndUpdate(
          { _id },
          {
            $set: {
              ...doc,
              primaryInstanceId: doc.primaryInstanceId || _id,
              modifiedBy: userId,
              updatedAt: new Date(),
            },
          },
          { new: true },
        ).lean();
      }

      const instanceId = nanoid();

      return this.create({
        _id: instanceId,
        ...doc,
        primaryInstanceId: doc.primaryInstanceId || instanceId,
        createdBy: userId,
        createdAt: new Date(),
      });
    }

    public static async findOrCreateMovementBucket(
      this: IFxaInstanceModel,
      {
        sourceInstance,
        branchId,
        departmentId,
        responsibleUserId,
        userId,
      }: TFxaMovementBucketParams,
    ) {
      const primaryInstanceId =
        sourceInstance.primaryInstanceId || sourceInstance._id;
      const bucketKey = {
        primaryInstanceId,
        branchId: normalizeBucketValue(branchId),
        departmentId: normalizeBucketValue(departmentId),
        responsibleUserId: normalizeBucketValue(responsibleUserId),
      };
      const existing = await this.findOne(bucketKey).lean();

      if (existing) {
        return existing;
      }

      return this.create({
        _id: nanoid(),
        fixedAssetId: sourceInstance.fixedAssetId,
        primaryInstanceId,
        categoryId: sourceInstance.categoryId,
        code: `${sourceInstance.code || sourceInstance._id}-M${nanoid(4)}`,
        count: 0,
        currentCount: 0,
        originalCost: sourceInstance.originalCost,
        depreciationMethod: sourceInstance.depreciationMethod,
        usefulLife: sourceInstance.usefulLife,
        salvageValue: sourceInstance.salvageValue,
        taxDepreciationMethod: sourceInstance.taxDepreciationMethod,
        taxUsefulLife: sourceInstance.taxUsefulLife,
        taxSalvageValue: sourceInstance.taxSalvageValue,
        acquisitionDate: sourceInstance.acquisitionDate,
        depreciationStartDate: sourceInstance.depreciationStartDate,
        branchId: bucketKey.branchId,
        currentBranchId: bucketKey.branchId,
        departmentId: bucketKey.departmentId,
        currentDepartmentId: bucketKey.departmentId,
        responsibleUserId: bucketKey.responsibleUserId,
        currentResponsibleUserId: bucketKey.responsibleUserId,
        status: FXA_INSTANCE_STATUSES.ACTIVE,
        currentStatus: FXA_INSTANCE_STATUSES.ACTIVE,
        transactionDetailId: sourceInstance.transactionDetailId,
        createdBy: userId,
        createdAt: new Date(),
      });
    }
  }

  fxaInstanceSchema.loadClass(FxaInstance);

  return fxaInstanceSchema;
};
