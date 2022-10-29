import { putActivityLog } from '@erxes/api-utils/src/logUtils';
import { IContext } from '../../../connectionResolver';
import messageBroker, { sendContactsMessage } from '../../../messageBroker';
import { getBalance, sendSms, updateBalance } from '../../../utils';

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

    const balance = await getBalance(subdomain, erxesCustomerId);

    const packageDetail = await models.Packages.findOne({ _id: packageId });

    if (!packageDetail) {
      throw new Error('Багц олдсонгүй');
    }

    if (amount > balance) {
      throw new Error('Үлдэгдэл хүрэлцэхгүй байна');
    }

    const newBalance = balance - amount;

    await updateBalance(subdomain, erxesCustomerId, newBalance);

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

    const body = `Та ${amount} төгрөгийн хөрөнгө оруулалт амжилттай хийлээ.`;

    await sendSms(subdomain, customer.primaryPhone, body);

    const investment = await models.Investments.createInvestment(doc);

    return investment;
  }
};

export default blockMutations;
