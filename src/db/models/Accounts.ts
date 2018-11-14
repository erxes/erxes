import { Model, model } from 'mongoose';
import { accountSchema, IAccount, IAccountDocument } from './definitions/accounts';

interface IIntegrationAccountModel extends Model<IAccountDocument> {
  createAccount(doc: IAccount): Promise<IAccountDocument>;
  removeAccount(_id: string): void;
}

class IntegrationAccount {
  /**
   * Create an integration account
   */
  public static async createAccount(doc: IAccount) {
    const { uid } = doc;

    const prevEntry = await Accounts.findOne({ uid });

    if (prevEntry) {
      throw new Error('Account already exists');
    }

    return Accounts.create(doc);
  }
  /**
   * Remove integration account
   */
  public static removeAccount(_id) {
    return Accounts.remove({ _id });
  }
}

accountSchema.loadClass(IntegrationAccount);

const Accounts = model<IAccountDocument, IIntegrationAccountModel>('accounts', accountSchema);

export default Accounts;
