import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { IFxaInstance, IFxaInstanceDocument } from '../../@types/fxaInstance';
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

type TFxaOptionalLocationUpdate = {
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  status?: string;
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
  restoreDisposalInstance(params: {
    instanceId: string;
    status: string;
  }): Promise<void>;
  restoreMoveInstance(
    instanceId: string,
    fields: TFxaOptionalLocationUpdate,
  ): Promise<void>;
  applyDisposal(params: {
    instanceId: string;
    status: string;
    userId: string;
  }): Promise<void>;
  applyMove(params: {
    instanceId: string;
    branchId: string;
    departmentId?: string;
    userId: string;
  }): Promise<void>;
}

const buildOptionalFieldUpdate = (
  fields: Record<string, string | undefined>,
) => {
  const $set: Record<string, string | Date> = { updatedAt: new Date() };
  const $unset: Record<string, string> = {};

  for (const [field, value] of Object.entries(fields)) {
    if (value) {
      $set[field] = value;
      continue;
    }

    $unset[field] = '';
  }

  return Object.keys($unset).length ? { $set, $unset } : { $set };
};

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
        status,
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
              modifiedBy: userId,
              updatedAt: new Date(),
            },
          },
          { new: true },
        ).lean();
      }

      return this.create({
        _id: nanoid(),
        ...doc,
        createdBy: userId,
        createdAt: new Date(),
      });
    }

    public static async restoreDisposalInstance(
      this: IFxaInstanceModel,
      {
        instanceId,
        status,
      }: {
        instanceId: string;
        status: string;
      },
    ) {
      await this.updateOne(
        { _id: instanceId },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
      );
    }

    public static async restoreMoveInstance(
      this: IFxaInstanceModel,
      instanceId: string,
      fields: TFxaOptionalLocationUpdate,
    ) {
      await this.updateOne(
        { _id: instanceId },
        buildOptionalFieldUpdate(fields),
      );
    }

    public static async applyDisposal(
      this: IFxaInstanceModel,
      {
        instanceId,
        status,
        userId,
      }: {
        instanceId: string;
        status: string;
        userId: string;
      },
    ) {
      await this.updateOne(
        { _id: instanceId },
        {
          $set: {
            status,
            modifiedBy: userId,
            updatedAt: new Date(),
          },
        },
      );
    }

    public static async applyMove(
      this: IFxaInstanceModel,
      {
        instanceId,
        branchId,
        departmentId,
        userId,
      }: {
        instanceId: string;
        branchId: string;
        departmentId?: string;
        userId: string;
      },
    ) {
      await this.updateOne(
        { _id: instanceId },
        {
          $set: {
            branchId,
            departmentId,
            modifiedBy: userId,
            updatedAt: new Date(),
          },
        },
      );
    }
  }

  fxaInstanceSchema.loadClass(FxaInstance);

  return fxaInstanceSchema;
};
