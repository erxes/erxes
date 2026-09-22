import { IGolomtBankConfigDocument } from '~/modules/corporateGateway/golomtbank/@types/golomtBank';
import { AccountsApi } from './api/accounts';
import { StatementsApi } from './api/statements';
import { TransferApi } from './api/transfer';

class GolomtBank {
  public apiUrl: string;
  public registerId: string;
  public name: string;
  public organizationName: string;
  public clientId: string;
  public ivKey: string;
  public sessionKey: string;
  public configPassword: string;
  public golomtCode: string;
  public accountId: string;
  public accounts: AccountsApi;
  public statements: StatementsApi;
  public transfer: TransferApi;

  constructor(config: IGolomtBankConfigDocument) {
    const auth = {
      registerId: config.registerId,
      name: config.name,
      organizationName: config.organizationName,
      clientId: config.clientId,
      ivKey: config.ivKey,
      sessionKey: config.sessionKey,
      configPassword: config.configPassword,
      accountId: config.accountId,
      golomtCode: config.golomtCode,
      apiUrl: config.apiUrl,
    };
    if (!auth.registerId || !auth.configPassword || !auth.apiUrl) {
      throw new Error(
        'Consumer register, url  and secret password are required',
      );
    }
    this.registerId = config.registerId;
    this.name = config.name;
    this.organizationName = config.organizationName;
    this.clientId = config.clientId;
    this.ivKey = config.ivKey;
    this.sessionKey = config.sessionKey;
    this.configPassword = config.configPassword;
    this.accountId = config.accountId;
    this.apiUrl = config.apiUrl; //"https://openapi-uat.golomtbank.com/api";
    this.golomtCode = config.golomtCode;

    this.accounts = new AccountsApi(this);
    this.transfer = new TransferApi(this);
    this.statements = new StatementsApi(this);
  }
}

export default GolomtBank;
