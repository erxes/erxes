import { IGolomtBankConfigDocument } from '../models/definitions/golomtBankConfigs';


class Khanbank {
  public apiUrl: string;
  public consumerKey: string;
  public secretKey: string;


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

  }
}

export default Khanbank;
