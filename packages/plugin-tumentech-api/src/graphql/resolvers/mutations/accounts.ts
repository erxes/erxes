import { IContext } from '../../../connectionResolver';
import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendCommonMessage,
  sendContactsMessage,
  sendCoreMessage
} from '../../../messageBroker';

const accountMutations = {
  manualTopup: async (_root, { customerId, amount }, { models }: IContext) => {
    const topup = await models.Topups.create({
      customerId,
      amount
    });

    await models.CustomerAccounts.addTopupAmount({
      customerId,
      amount
    });

    return topup;
  },

  topupAccount: async (
    _root,
    { invoiceId }: { invoiceId: string },
    { models, cpUser, subdomain }: IContext
  ) => {
    const invoice = await sendCommonMessage({
      subdomain,
      serviceName: 'payment',
      action: 'invoices.findOne',
      data: {
        _id: invoiceId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const user = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.erxesCustomerId !== invoice.customerId) {
      throw new Error('User data mismatch');
    }

    const topup = await models.Topups.createTopup({
      invoiceId,
      customerId: invoice.customerId,
      amount: invoice.amount
    });

    await models.CustomerAccounts.addTopupAmount({
      customerId: invoice.customerId,
      amount: invoice.amount
    });

    return topup;
  },

  revealPhone: async (
    _root,
    {
      driverId,
      carId,
      dealId
    }: { driverId: string; carId: string; dealId: string },
    { models, cpUser, subdomain }: IContext
  ) => {
    const user = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!user) {
      throw new Error('login required');
    }

    const account = await models.CustomerAccounts.findOne({
      customerId: user.erxesCustomerId
    });

    if (!account) {
      throw new Error('Данс олдсонгүй, данс үүсгэнэ үү');
    }

    const car = await models.Cars.getCar(carId);

    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.getConformities',
      data: {
        mainType: 'customer',
        mainTypeIds: [driverId],
        relTypes: ['car']
      },
      isRPC: true,
      defaultValue: []
    });

    const conformity = conformities.find(c => c.relTypeId === carId);

    if (!conformity) {
      throw new Error('Driver and car are not related');
    }

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: driverId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!customer || !customer.primaryPhone) {
      throw new Error('Customer not found');
    }

    const history = await models.PurchaseHistories.findOne({
      cpUserId: user._id,
      driverId,
      carId: car._id,
      dealId
    });

    if (history) {
      return customer.primaryPhone;
    }

    const carCategory = await models.CarCategories.getCarCatogery({
      _id: car.carCategoryId
    });

    const parenctCarCategory = await models.CarCategories.getCarCatogery({
      _id: carCategory.parentId
    });

    if (!carCategory.description && !parenctCarCategory.description) {
      throw new Error('Car category price is not set');
    }

    const amount = Number(
      carCategory.description || parenctCarCategory.description || 0
    );

    if (amount === 0) {
      throw new Error('Car category price is not set');
    }

    if (account.balance < amount) {
      throw new Error('Дансны үлдэгдэл хүрэлцэхгүй байна');
    }

    account.balance -= amount;

    await models.CustomerAccounts.updateOne(
      { _id: account._id },
      { $set: { balance: account.balance } }
    );

    await models.PurchaseHistories.createHistory({
      carId: car._id,
      driverId,
      dealId,
      amount,
      cpUserId: user._id,
      phone: customer.primaryPhone
    });

    const receiver = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        erxesCustomerId: driverId,
        clientPortalId: process.env.MOBILE_CP_ID || ''
      },
      isRPC: true,
      defaultValue: null
    });

    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: {
        _id: dealId
      },
      isRPC: true,
      defaultValue: null
    });

    if (deal && receiver) {
      sendClientPortalMessage({
        subdomain,
        action: 'sendNotification',
        data: {
          title: 'Мэдэгдэл',
          content: `Таны ${deal.name} дугаартай ажилд илгээсэн таны мэдээлэлтэй танилцлаа, бид тантай эргэн холбогдох болно.`,
          receivers: [receiver._id],
          notifType: 'system',
          link: '',
          isMobile: true
        }
      });
    }

    return customer.primaryPhone;
  }
};

export default accountMutations;
