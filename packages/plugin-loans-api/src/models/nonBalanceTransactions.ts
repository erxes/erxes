import { INonBalanceTransaction, nonBalanceTransactionSchema, INonBalanceTransactionDocument } from './definitions/nonBalanceTransactions';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongoose';

export interface INonBalanceTransactionModel extends Model<INonBalanceTransactionDocument> {
  getNonBalanceTransaction(selector: FilterQuery<INonBalanceTransactionDocument>);
  createNonBalanceTransaction(
    subdomain: string,
    doc: INonBalanceTransaction
  ): Promise<INonBalanceTransactionDocument>;
  updateNonBalanceTransaction(_id: string, doc: INonBalanceTransaction);
  changeNonBalanceTransaction(_id: string, doc: INonBalanceTransaction);
  removeNonBalanceTransactions(_ids: string[]);
  getPaymentInfo(
    id: string,
    payDate: Date,
    subdomain: string,
    scheduleDate?: Date
  );
  createEBarimtOnTransaction(
    subdomain: string,
    id: string,
    isGetEBarimt?: boolean,
    isOrganization?: boolean,
    organizationRegister?: string
  );
}
export const loadNonBalanceTransactionClass = (models: IModels) => {
  class NonBalanceTransaction {
    /**
     *
     * Get nonBalanceTransaction
     */

    public static async getNonBalanceTransaction(
      selector: FilterQuery<INonBalanceTransactionDocument>
    ) {
      const NonBalanceTransaction = await models.NonBalanceTransactions.findOne(selector);

      if (!NonBalanceTransaction) {
        throw new Error('Non Balance Transaction not found');
      }

      return NonBalanceTransaction;
    }

        /**
     * Update Non Balance Transaction
     */
      public static async updateNonBalanceTransaction(
        _id: string,
        doc: INonBalanceTransaction
      ) {

        await models.NonBalanceTransactions.updateOne(
          { _id },
          { $set: { ...doc  } }
        );

        return await models.NonBalanceTransactions.getNonBalanceTransaction({
          _id
        });
      }
    
    /**
     * Create a Non Balance transaction
     */
    public static async createNonBalanceTransaction(subdomain,
      {
        ...doc
      }: INonBalanceTransaction
    ) {
      return await models.NonBalanceTransactions.create({ ...doc });
    }
        /**
     * Remove Non Balance Transaction
     */
        public static async removeNonBalanceTransactions(_ids) {
          const nonBalanceTransactions: INonBalanceTransactionDocument[] = await models.NonBalanceTransactions.find(
            { _id: _ids }
          ).lean();
          
          for await (const oldNonBalTr of nonBalanceTransactions) {
            if (oldNonBalTr) {
              await models.NonBalanceTransactions.deleteOne({ _id: oldNonBalTr._id });
            }
          }
        }

  }
  nonBalanceTransactionSchema.loadClass(NonBalanceTransaction);
  return nonBalanceTransactionSchema;
};
