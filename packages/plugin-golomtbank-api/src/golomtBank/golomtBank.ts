
import { AccountsApi } from './api/accounts';

// export async function  GolomtBank (config:any ){

//   const accountList = new AccountsApi(config);
//   return accountList
// }
class GolomtBank {
  public accounts: AccountsApi;

  public url = 'https://openapi-uat.golomtbank.com/api';
  public sessionKey = 'A6d26tFgKEFLCawY';
  public ivKey = 'qJIboRV56D4S1NiS';
  public password = 'yoK=pri@Ahux2$rIw';
  public clientId = '88974537498305151326';

  constructor() {
    this.accounts = new AccountsApi(this);
  }

  signin(){
    
  }

  resetToken(){

  }
}

export default GolomtBank;