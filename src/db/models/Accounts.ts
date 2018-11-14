import { Model, model } from 'mongoose';
import { accountSchema, IAccount, IAccountDocument } from './definitions/accounts';

interface IAccountModel extends Model<IAccountDocument> {
  createAccount(doc: IAccount): Promise<IAccountDocument>;
  removeAccount(_id: string): void;
}

class Account {
  /**
   * Create an integration account
   */
  public static async createAccount(doc: IAccount) {
    const { uid } = doc;

    const prevEntry = await Accounts.findOne({ uid });

    if (prevEntry) {
      return null;
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

accountSchema.loadClass(Account);

const Accounts = model<IAccountDocument, IAccountModel>('accounts', accountSchema);

export default Accounts;
