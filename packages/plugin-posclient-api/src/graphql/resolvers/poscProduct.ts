import { IContext } from '../../connectionResolver';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';
import { sendCommonMessage } from '../../messageBroker';

export default {
  customFieldsDataByFieldCode(product, _, { subdomain }: IContext) {
    return customFieldsDataByFieldCode(product, subdomain, sendCommonMessage);
  }
};
