import { IKhanbankConfigDocument } from '../models/definitions/khanbankConfigs';
import { AccountsApi } from './api/accounts';
import { StatementsApi } from './api/statements';
import { TaxesApi } from './api/taxes';
import { TransferApi } from './api/transfer';

class Khanbank {
  public apiUrl: string;
  public consumerKey: string;
  public secretKey: string;
  public accounts: AccountsApi;
  public statements: StatementsApi;
  public transfer: TransferApi;
  public taxes: TaxesApi;

  constructor(config: IKhanbankConfigDocument) {
    const auth = {
      consumerKey: config.consumerKey,
      secretKey: config.secretKey
    };

    if (!auth.consumerKey || !auth.secretKey) {
      throw new Error('Consumer key and secret key are required');
    }

    this.consumerKey = config.consumerKey;
    this.secretKey = config.secretKey;

    this.apiUrl = 'https://api.khanbank.com/v1';

    this.accounts = new AccountsApi(this);
    this.statements = new StatementsApi(this);
    this.transfer = new TransferApi(this);
    this.taxes = new TaxesApi(this);
  }
}

export default Khanbank;
