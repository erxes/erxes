import { IGolomtBankConfigDocument } from "../models/definitions/golomtBankConfigs";
import { AccountsApi } from "./api/accounts";
import { StatementsApi } from "./api/statements";

class GolomtBank {
  public apiUrl: string;
  public registerId: string;
  public name: string;
  public organizationName: string;
  public clientId: string;
  public ivKey: string;
  public sessionKey: string;
  public configPassword: string;
  public accountId: string;
  public accounts: AccountsApi;
  public statements: StatementsApi;

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
    };

    if (!auth.registerId || !auth.configPassword) {
      throw new Error("Consumer register and secret password are required");
    }
    this.registerId = config.registerId;
    this.name = config.name;
    this.organizationName = config.organizationName;
    this.clientId = config.clientId;
    this.ivKey = config.ivKey;
    this.sessionKey = config.sessionKey;
    this.configPassword = config.configPassword;
    this.accountId = config.accountId;
    this.apiUrl = "https://openapi-uat.golomtbank.com/api";

    this.accounts = new AccountsApi(this);
    this.statements = new StatementsApi(this);
  }
}

export default GolomtBank;
