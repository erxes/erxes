import { putActivityLog } from '@erxes/api-utils/src/logUtils';
import { IContext } from '../../../connectionResolver';
import messageBroker, { sendContactsMessage } from '../../../messageBroker';
import {
  getBalance,
  numberWithCommas,
  sendSms,
  updateBalance
} from '../../../utils';

const blockMutations = {
  /**
   * Creates a new package
   */
  async invest(
    _root,
    doc: { erxesCustomerId: string; packageId: string; amount: number },
    { subdomain, models }: IContext
  ) {
    const { packageId, erxesCustomerId, amount } = doc;

    const block = await models.Blocks.findOne({ erxesCustomerId });
    const balance = block?.balance || 0;

    const packageDetail = await models.Packages.findOne({ _id: packageId });

    if (!packageDetail) {
      throw new Error('Багц олдсонгүй');
    }

    if (amount > balance) {
      throw new Error('Үлдэгдэл хүрэлцэхгүй байна');
    }

    const newBalance = balance - amount;

    await models.Blocks.updateOne({ erxesCustomerId }, { balance: newBalance });

    await putActivityLog(subdomain, {
      messageBroker: messageBroker(),
      action: 'add',
      data: {
        action: 'invest',
        contentType: 'block:invest',
        createdBy: 'service',
        contentId: erxesCustomerId,
        content: { packageId, amount }
      }
    });

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: erxesCustomerId
      },
      isRPC: true
    });

    const numberAmount = numberWithCommas(amount);

    const body = `UB GROUP: Таны ${numberAmount} төгрөгийн хөрөнгө оруулалт баталгаажлаа. Та хөрөнгө оруулалттай холбоотой мэдээллийг 72228888 дугаараас лавлана уу.`;

    await sendSms(subdomain, customer.primaryPhone, body);

    const investment = await models.Investments.createInvestment(doc);

    return investment;
  },

  async addBalance(
    _root,
    doc: { erxesCustomerId: string; amount: number },
    { subdomain, models }: IContext
  ) {
    const { erxesCustomerId, amount } = doc;
    const block = await models.Blocks.findOne({ erxesCustomerId });
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: erxesCustomerId
      },
      isRPC: true
    });

    if (block) {
      const currentBalance = block.balance || 0;

      const updatedBalance = currentBalance + amount;

      await models.Blocks.updateOne(
        { erxesCustomerId },
        { balance: updatedBalance }
      );
    } else {
      await models.Blocks.create({ erxesCustomerId, balance: amount });
    }

    const numberAmount = numberWithCommas(amount);

    const body = `UB GROUP: Таны данс ${numberAmount} төгрөгөөр цэнэглэгдлээ. Та гэрээ, үйлчилгээний нөхцлүүд болон UB GROUP DROPS-тай анхааралтай танилцаж, хөрөнгө оруулалтаа хийнэ үү. Та хөрөнгө оруулалттай холбоотой мэдээллийг 72228888 дугаараас лавлана уу.`;

    await sendSms(subdomain, customer.primaryPhone, body);

    return block;
  },

  async updateVerify(
    _root,
    doc: { erxesCustomerId: string; isVerified: string },
    { subdomain, models }: IContext
  ) {
    const { erxesCustomerId, isVerified } = doc;
    const block = await models.Blocks.findOne({ erxesCustomerId });

    if (block) {
      await models.Blocks.updateOne({ erxesCustomerId }, { isVerified });
    } else {
      await models.Blocks.create({ erxesCustomerId, isVerified });
    }

    if (isVerified === 'true') {
      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: {
          _id: erxesCustomerId
        },
        isRPC: true
      });

      const body = `UB GROUP: Таны мэдээлэл амжилтаай баталгаажлаа. хөрөнгө оруулалттай холбоотой мэдээллийг 72228888 дугаараас лавлана уу.`;

      await sendSms(subdomain, customer.primaryPhone, body);
    }

    return block;
  }
};

export default blockMutations;
