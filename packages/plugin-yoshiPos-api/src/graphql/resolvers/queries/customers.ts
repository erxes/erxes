import Customers from '../../../models/Customers';

interface IListArgs {
  searchValue?: string;
}

const customerQueries = {
  async customers(_root, { searchValue }: IListArgs) {
    const filter: any = {};

    if (searchValue) {
      const customerById = await Customers.findOne({ _id: searchValue }).lean();

      if (customerById) {
        return [{ ...customerById, isOne: true }];
      }

      const regex = new RegExp(`${searchValue}`, 'i');

      filter.$or = [
        { primaryEmail: regex },
        { firstName: regex },
        { primaryPhone: regex },
        { lastName: regex }
      ];
    }

    return Customers.find(filter)
      .limit(10)
      .lean();
  },

  customerDetail(_root, { _id }: { _id: string }) {
    return Customers.findOne({ _id });
  }
};

export default customerQueries;
