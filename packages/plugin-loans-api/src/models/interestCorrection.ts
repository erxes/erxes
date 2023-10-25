import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IInterestCorrection,
  IInterestCorrectionDocument,
  InterestCorrectionSchema
} from './definitions/interestCorrection';
import { INTEREST_CORRECTION_TYPE } from './definitions/constants';

export const loanInterestCorrectionClass = (models: IModels) => {
  class InterestCorrection {
    public static async stopInterest({
      contractId,
      stoppedDate,
      isStopLoss,
      interestAmount,
      lossAmount
    }: {
      contractId: string;
      stoppedDate: Date;
      isStopLoss: boolean;
      interestAmount: number;
      lossAmount: number;
    }) {
      const interestCorrection = await models.InterestCorrection.findOne({
        contractId,
        type: INTEREST_CORRECTION_TYPE.STOP_INTEREST
      });

      if (!!interestCorrection) {
        throw new Error('Interest already stopped');
      }

      const interestStop = await models.InterestCorrection.create({
        isStopLoss,
        contractId,
        invDate: stoppedDate,
        interestAmount,
        lossAmount,
        type: INTEREST_CORRECTION_TYPE.STOP_INTEREST
      });

      await models.Contracts.updateOne(
        {
          _id: contractId
        },
        {
          $set: {
            stoppedDate: interestStop.invDate,
            isStoppedInterest: true
          }
        }
      );

      return { _id: contractId };
    }

    public static async interestChange({
      contractId,
      stoppedDate,
      interestAmount,
      lossAmount
    }: {
      contractId: string;
      stoppedDate: Date;
      isStopLoss: boolean;
      interestAmount: number;
      lossAmount: number;
    }) {
      const contract = await models.Contracts.findOne({ _id: contractId });

      const interestChange = await models.InterestCorrection.create({
        contractId,
        invDate: stoppedDate,
        interestAmount,
        lossAmount,
        type: INTEREST_CORRECTION_TYPE.INTEREST_CHANGE
      });

      await models.Contracts.updateOne(
        {
          _id: contractId
        },
        {
          $inc: {
            storedInterest: interestChange.interestAmount
          }
        }
      ).lean();

      return contract;
    }

    public static async interestReturn({
      contractId,
      invDate,
      interestAmount
    }: {
      contractId: string;
      invDate: Date;
      interestAmount: number;
    }) {
      const contract = await models.Contracts.findOne({ _id: contractId });

      const interestReturn = await models.InterestCorrection.create({
        contractId,
        invDate: invDate,
        interestAmount,
        type: INTEREST_CORRECTION_TYPE.INTEREST_CHANGE
      });

      await models.Contracts.updateOne(
        {
          _id: contractId
        },
        {
          $inc: {
            storedInterest: interestReturn.interestAmount * -1
          }
        }
      ).lean();

      return contract;
    }
  }
  InterestCorrectionSchema.loadClass(InterestCorrection);
  return InterestCorrectionSchema;
};

export interface IInterestCorrectionModel
  extends Model<IInterestCorrectionDocument> {
  stopInterest({
    contractId,
    stoppedDate,
    isStopLoss,
    interestAmount,
    lossAmount
  }: {
    contractId: string;
    stoppedDate: Date;
    isStopLoss: boolean;
    interestAmount: number;
    lossAmount: number;
  });
  interestChange({
    contractId,
    stoppedDate,
    interestAmount,
    lossAmount
  }: {
    contractId: string;
    stoppedDate: Date;
    interestAmount: number;
    lossAmount: number;
  });
  interestReturn({
    contractId,
    invDate,
    interestAmount
  }: {
    contractId: string;
    invDate: Date;
    interestAmount: number;
  });
}
