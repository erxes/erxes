// vendorAddInsuranceItem

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { IRiskDocument } from '../../../models/definitions/risks';
import { verifyVendor } from '../utils';

const mutations = {
  vendorAddInsuranceItem: async (
    _root,
    { doc },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const { company, clientportal } = await verifyVendor({
      subdomain,
      cpUser
    });

    console.log('company', company);

    const { companyId, customerId } = doc;

    if (!companyId && !customerId) {
      throw new Error('Customer or Company is required');
    }

    const itemDoc = {
      ...doc,
      vendorUserId: cpUser.userId,
      status: 'active'
    };

    const dealDoc = {
      cpUser,
      doc: {
        type: 'deal',
        subject: 'Insurance Deal',

        stageId: clientportal.dealStageId
      }
    };

    console.log('dealDoc', dealDoc);

    const deal = await sendCommonMessage({
      subdomain,
      action: 'createCard',
      serviceName: 'clientportal',
      isRPC: true,
      data: dealDoc
    });

    console.log('deal', deal);

    if (!deal) {
      throw new Error('Deal not created');
    }

    itemDoc.dealId = deal._id;

    const insuranceItem = await models.Items.createInsuranceItem(itemDoc);

    if (!insuranceItem) {
      throw new Error('Insurance Item not created');
    }

    return insuranceItem;
  },

  vendorEditInsuranceItem: async (
    _root,
    { _id, doc },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    await verifyVendor({
      subdomain,
      cpUser
    });

    return models.Items.updateInsuranceItem({ _id, ...doc });
  }
};

export default mutations;
