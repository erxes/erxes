import { IGolomtBankConfigDocument } from '../models/definitions/golomtBankConfigs';
import { AccountsApi } from './api/accounts';
// import { StatementsApi } from './api/statements';
// import { TaxesApi } from './api/taxes';
// import { TransferApi } from './api/transfer';

class GolomtBank {
  public apiUrl: string;
  public registerId: string;
  public name: string;
  public organizationName: string;
  public clientId: string;
  public ivKey: string;
  public sessionKey: string;
  public configPassword: string;
  public accounts: AccountsApi;
  // public statements: StatementsApi;
  // public transfer: TransferApi;
  // public taxes: TaxesApi;

  constructor(config: IGolomtBankConfigDocument) {
    const auth = {
      registerId: config.registerId,
      name: config.name,
      organizationName: config.organizationName,
      clientId: config.clientId,
      ivKey: config.ivKey,
      sessionKey: config.sessionKey,
      configPassword: config.configPassword
    };

    if (!auth.clientId || !auth.sessionKey) {
      throw new Error('Consumer key and secret key are required');
    }
    this.registerId = config.registerId;
    this.name = config.name;
    this.organizationName = config.organizationName;
    this.clientId = config.clientId;
    this.ivKey = config.ivKey;
    this.sessionKey = config.sessionKey;
    this.configPassword = config.configPassword;

    this.apiUrl = 'https://openapi-uat.golomtbank.com/api';

    this.accounts = new AccountsApi(this);
    // this.statements = new StatementsApi(this);
    // this.transfer = new TransferApi(this);
    // this.taxes = new TaxesApi(this);
  }
}

export default GolomtBank;
