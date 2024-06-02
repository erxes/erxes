import { AccountsApi } from '../api/accounts';
import { StatementsApi } from '../api/statements';
import { IGolomtBankConfigDocument } from '../models/definitions/golomtBankConfigs';

class GolomtBank {
  public apiUrl: string;
  public consumerKey: string;
  public secretKey: string;
  public accounts: AccountsApi;
  public statements: StatementsApi;

  constructor(config: IGolomtBankConfigDocument) {
    const auth = {
      consumerKey: config.consumerKey,
      secretKey: config.secretKey
    };

    if (!auth.consumerKey || !auth.secretKey) {
      throw new Error('Config key and secret key are required');
    }

    this.consumerKey = config.consumerKey;
    this.secretKey = config.secretKey;

    this.apiUrl = 'https://api.golomt.com/v1';

    this.accounts = new AccountsApi(this);
    this.statements = new StatementsApi(this);

  }
}

export default GolomtBank;
