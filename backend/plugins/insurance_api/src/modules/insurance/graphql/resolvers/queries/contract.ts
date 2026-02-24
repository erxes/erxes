import { IContext } from '~/connectionResolvers';

export const contractQueries = {
  contracts: async (
    _parent: undefined,
    { vendorId, customerId }: { vendorId?: string; customerId?: string },
    { models }: IContext,
  ) => {
    const query: any = {};
    if (vendorId) query.vendor = vendorId;
    if (customerId) query.customer = customerId;

    const contracts = await models.Contract.find(query).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    return contracts
      .filter((c: any) => c.insuranceProduct != null)
      .map((c: any) => ({
        ...c.toObject(),
        coveredRisks: c.coveredRisks.filter((cr: any) => cr.risk != null),
      }));
  },

  contract: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    const contract = await models.Contract.findById(id).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    if (!contract || !contract.insuranceProduct) return null;

    return {
      ...contract.toObject(),
      coveredRisks: contract.coveredRisks.filter((cr: any) => cr.risk != null),
    };
  },

  vendorContracts: async (
    _parent: undefined,
    _args: any,
    { models, insuranceVendorUser }: IContext,
  ) => {
    if (!insuranceVendorUser) throw new Error('Must be logged in');

    const vendorUser = await models.VendorUser.findById(
      insuranceVendorUser._id,
    );
    if (!vendorUser) throw new Error('Vendor user not found');

    const contracts = await models.Contract.find({
      vendor: vendorUser.vendor,
    }).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    return contracts
      .filter((c: any) => c.insuranceProduct != null)
      .map((c: any) => ({
        ...c.toObject(),
        coveredRisks: c.coveredRisks.filter((cr: any) => cr.risk != null),
      }));
  },

  vendorContract: async (
    _parent: undefined,
    { id }: { id: string },
    { models, insuranceVendorUser }: IContext,
  ) => {
    if (!insuranceVendorUser) throw new Error('Must be logged in');

    const vendorUser = await models.VendorUser.findById(
      insuranceVendorUser._id,
    );
    if (!vendorUser) throw new Error('Vendor user not found');

    const contract = await models.Contract.findOne({
      _id: id,
      vendor: vendorUser.vendor,
    }).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    if (!contract || !contract.insuranceProduct) return null;

    return {
      ...contract.toObject(),
      coveredRisks: contract.coveredRisks.filter((cr: any) => cr.risk != null),
    };
  },

  vendorInsuranceItems: Object.assign(
    async (
      _parent: undefined,
      {
        page = 1,
        perPage = 20,
        filters,
        endDate,
        startDate,
        sortDirection,
        sortField,
        vendorUserId,
        categoryId,
      }: {
        page?: number;
        perPage?: number;
        filters?: any;
        endDate?: Date;
        startDate?: Date;
        sortDirection?: string;
        sortField?: string;
        vendorUserId?: string;
        categoryId?: string;
      },
      { models, insuranceVendorUser }: IContext,
    ) => {
      if (!insuranceVendorUser) throw new Error('Must be logged in');
      // Handle both user.id and user._id for compatibility with JWT token
      // userId from vendorUserLogin JWT is a valid ObjectId, user.id from erxes core is not

      const vendorUser = await models.VendorUser.findOne({
        _id: insuranceVendorUser._id,
      });
      if (!vendorUser) throw new Error('Vendor user not found');

      const query: any = { vendor: vendorUser.vendor };

      // Category/Type filter
      if (categoryId) {
        query.insuranceType = categoryId;
      }

      // Date range filter
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = startDate;
        if (endDate) query.startDate.$lte = endDate;
      }

      // Additional filters from filters object
      if (filters) {
        // Contract number filter
        if (filters.contractNumber) {
          query.contractNumber = {
            $regex: filters.contractNumber,
            $options: 'i',
          };
        }

        // Payment status filter
        if (filters.paymentStatus) {
          query.paymentStatus = filters.paymentStatus;
        }

        // Payment kind filter
        if (filters.paymentKind) {
          query.paymentKind = filters.paymentKind;
        }

        // Insurance product filter
        if (filters.insuranceProductId) {
          query.insuranceProduct = filters.insuranceProductId;
        }

        // Customer registration number filter
        if (filters.customerRegistration) {
          const customers = await models.Customer.find({
            registrationNumber: {
              $regex: filters.customerRegistration,
              $options: 'i',
            },
          }).select('_id');
          if (customers.length > 0) {
            query.customer = { $in: customers.map((c: any) => c._id) };
          } else {
            query.customer = null; // No matching customers
          }
        }

        // Customer name filter (firstName or lastName)
        if (filters.customerName) {
          const customers = await models.Customer.find({
            $or: [
              { firstName: { $regex: filters.customerName, $options: 'i' } },
              { lastName: { $regex: filters.customerName, $options: 'i' } },
            ],
          }).select('_id');
          if (customers.length > 0) {
            query.customer = { $in: customers.map((c: any) => c._id) };
          } else {
            query.customer = null;
          }
        }

        // Vehicle plate number filter (from insuredObject)
        if (filters.plateNumber) {
          query['insuredObject.Улсын дугаар'] = {
            $regex: filters.plateNumber,
            $options: 'i',
          };
        }

        // Vehicle mark filter (from insuredObject)
        if (filters.vehicleMark) {
          query['insuredObject.Тээврийн хэрэгслийн марк'] = {
            $regex: filters.vehicleMark,
            $options: 'i',
          };
        }

        // Charged amount range filter
        if (filters.minAmount || filters.maxAmount) {
          query.chargedAmount = {};
          if (filters.minAmount)
            query.chargedAmount.$gte = parseFloat(filters.minAmount);
          if (filters.maxAmount)
            query.chargedAmount.$lte = parseFloat(filters.maxAmount);
        }
      }

      const sort: any = {};
      if (sortField) {
        sort[sortField] = sortDirection === 'DESC' ? -1 : 1;
      } else {
        sort.createdAt = -1;
      }

      const skip = (page - 1) * perPage;

      const [list, totalCount] = await Promise.all([
        models.Contract.find(query)
          .sort(sort)
          .skip(skip)
          .limit(perPage)
          .populate('vendor customer insuranceType insuranceProduct'),
        models.Contract.countDocuments(query),
      ]);

      return {
        list: list.filter((c: any) => c.insuranceProduct != null),
        totalCount,
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  vendorInsuranceItem: Object.assign(
    async (
      _parent: undefined,
      { _id }: { _id: string },
      { models, insuranceVendorUser }: IContext,
    ) => {
      if (!insuranceVendorUser) throw new Error('Must be logged in');

      const vendorUser = await models.VendorUser.findById(
        insuranceVendorUser._id,
      );
      if (!vendorUser) throw new Error('Vendor user not found');

      const contract = await models.Contract.findOne({
        _id,
        vendor: vendorUser.vendor,
      }).populate('vendor customer insuranceType insuranceProduct');

      return contract;
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
