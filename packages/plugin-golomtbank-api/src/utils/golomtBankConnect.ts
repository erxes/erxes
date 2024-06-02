
import { IGolomtBankConfigDocument } from '../models/definitions/golomtBankConfigs';

class GolomtBank {
  public apiUrl: string;
  public consumerKey: string;
  public secretKey: string;

  constructor(config: IGolomtBankConfigDocument) {
    const auth = {
      consumerKey: config.clientId,
      secretKey: config.sessionKey
    };

    if (!auth.consumerKey || !auth.secretKey) {
      throw new Error('Config key and secret key are required');
    }

    this.consumerKey = config.clientId;
    this.secretKey = config.sessionKey;

    this.apiUrl = 'https://api.golomt.com/v1';


  }
}

export default GolomtBank;
