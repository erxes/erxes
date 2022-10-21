import { IContext } from '../../../connectionResolver';
import { getBalance, updateBalance } from '../../../utils';

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

    const investment = await models.Investments.createInvestment(doc);

    return investment;
  }
};

export default blockMutations;
