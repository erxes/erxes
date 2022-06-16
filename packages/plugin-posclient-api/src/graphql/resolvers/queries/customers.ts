import Customers from '../../../models/Customers';

interface IListArgs {
  searchValue?: string;
}

const customerQueries = {
  async customers(_root, models, { searchValue }: IListArgs) {
    const filter: any = {};

    if (searchValue) {
      const customerById = await models.Customers.findOne({
        _id: searchValue
      }).lean();

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

    return models.Customers.find(filter)
      .limit(10)
      .lean();
  },

  customerDetail(_root, models, { _id }: { _id: string }) {
    return models.Customers.findOne({ _id });
  }
};

export default customerQueries;
