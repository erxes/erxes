import { putActivityLog } from '@erxes/api-utils/src/logUtils';
import { IContext } from '../../../connectionResolver';
import messageBroker, { sendContactsMessage } from '../../../messageBroker';
import { numberWithCommas, sendSms } from '../../../utils';

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

    const body = `UB GROUP: Tanii ${numberAmount} tugrugiin hurungu oruulalt amjilttai batalgaajlaa. 72228888`;

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

    const body = `UB GROUP: Tanii dans ${numberAmount} tugruguur tseneglegdlee. Ta gereeteigee saitar taniltsan hurungu oruulaltaa hiine uu.72228888`;

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

      const body = `UB GROUP: Tanii medeelel amjilttai batalgaajlaa. Ta dansaa tseneglen hurungu oruulaltaa hiine uu 72228888`;

      await sendSms(subdomain, customer.primaryPhone, body);
    }

    return block;
  }
};

export default blockMutations;
