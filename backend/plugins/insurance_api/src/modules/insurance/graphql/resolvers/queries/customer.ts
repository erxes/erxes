import { IContext } from '~/connectionResolvers';

export const customerQueries = {
  insuranceCustomers: Object.assign(
    async (_parent: undefined, args: any, { models }: IContext) => {
      const { search, page = 1, limit = 100, sort, sortField, filter } = args;
      const query: any = {};

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { registrationNumber: { $regex: search, $options: 'i' } },
        ];
      }

      if (filter) {
        Object.keys(filter).forEach((key) => {
          if (filter[key]) {
            query[key] = filter[key];
          }
        });
      }

      const sortOptions: any = {};
      if (sort && sortField) {
        sortOptions[sortField] = sort === 'DESC' ? -1 : 1;
      }

      const skip = (page - 1) * limit;

      return models.Customer.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  customer: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      return models.Customer.findById(id);
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  customerByRegistration: Object.assign(
    async (
      _parent: undefined,
      { registrationNumber }: { registrationNumber: string },
      { models }: IContext,
    ) => {
      return models.Customer.findOne({ registrationNumber });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  customerByEmail: Object.assign(
    async (
      _parent: undefined,
      { email }: { email: string },
      { models }: IContext,
    ) => {
      return models.Customer.findOne({ email });
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
