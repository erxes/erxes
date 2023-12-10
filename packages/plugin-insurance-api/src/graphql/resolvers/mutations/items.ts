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
        subject: `Даатгалын гэрээ - ${company.name}`,
        closeDate: doc.closeDate,
        startDate: doc.startDate,
        customerId: doc.customerId,
        companyId: doc.companyId,
        stageId: clientportal.dealStageId
      }
    };

    const deal = await sendCommonMessage({
      subdomain,
      action: 'createCard',
      serviceName: 'clientportal',
      isRPC: true,
      data: dealDoc
    });

    if (!deal) {
      throw new Error('Deal not created');
    }

    itemDoc.dealId = deal._id;
    itemDoc.feePercent = 0;

    const product = await models.Products.findOne({
      _id: itemDoc.productId
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const companyProductConfigs = product.companyProductConfigs || [];

    const companyProductConfig = companyProductConfigs.find(
      config => config.companyId === company._id
    );

    if (!companyProductConfig) {
      itemDoc.feePercent = product.price;
    } else {
      itemDoc.feePercent = companyProductConfig.specificPrice;
    }

    itemDoc.totalFee = (itemDoc.price / 100) * itemDoc.feePercent;

    const customer = await sendCommonMessage({
      subdomain,
      action: 'customers.findOne',
      serviceName: 'contacts',
      isRPC: true,
      data: { _id: itemDoc.customerId }
    });

    const searchDictionary = {
      dealNumber: deal.number || '',
      dealCreatedAt: deal.createdAt,
      dealCloseDate: deal.closeDate,
      dealStartDate: deal.startDate,

      customerRegister: customer.code || '',
      customerFirstName: customer.firstName || '',
      customerLastName: customer.lastName || '',

      itemPrice: itemDoc.price,
      itemFeePercent: itemDoc.feePercent,
      itemTotalFee: itemDoc.totalFee
    };

    itemDoc.searchDictionary = searchDictionary;

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
