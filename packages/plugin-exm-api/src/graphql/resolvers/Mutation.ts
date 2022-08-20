import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const exmMutations = {
  /**
   * Create new message
   */
  async exmsAdd(_root, doc: any, { user, models }: IContext) {
    const exm = await models.Exms.createExm(doc, user);

    return exm;
  },

  async exmsEdit(_root, { _id, ...doc }: any, { models }: IContext) {
    const updated = await models.Exms.updateExm(_id, doc);

    return updated;
  },

  async exmsRemove(_root, { _id }: any, { models }: IContext) {
    const updated = await models.Exms.removeExm(_id);

    return updated;
  },

  async userRegistrationCreate(_root, doc, { subdomain }: IContext) {
    const { email } = doc;

    const mail = email.toLowerCase().trim();

    const userCount = await sendCoreMessage({
      subdomain,
      action: 'users.getCount',
      data: {
        query: {
          email: mail
        }
      },
      isRPC: true
    });

    if (userCount > 0) {
      throw new Error('You have already registered');
    }

    try {
      return sendCoreMessage({
        subdomain,
        action: 'users.create',
        data: {
          isActive: false,
          email: mail,
          password: doc.password
        },
        isRPC: true
      });
    } catch (e) {
      throw e;
    }
  }
};

checkPermission(exmMutations, 'exmsAdd', 'exmsAdd');
checkPermission(exmMutations, 'updateExm', 'updateExm');
checkPermission(exmMutations, 'removeExm', 'removeExm');

export default exmMutations;
