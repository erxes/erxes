import { IContext } from '~/connectionResolvers';

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const contractQueries = {
  contracts: Object.assign(
    async (
      _parent: undefined,
      args: {
        vendorId?: string;
        customerId?: string;
        searchValue?: string;
        contractNumber?: string;
        customerRegistration?: string;
        plateNumber?: string;
        paymentStatus?: string;
        insuranceTypeId?: string;
        startDate?: any;
        endDate?: any;
      },
      { models }: IContext,
    ) => {
      try {
        const query: any = {};

        const str = (v: any) =>
          typeof v === 'string' && v.trim() ? v.trim() : '';
        const validDate = (v: any) => {
          if (!v) return null;
          const d = new Date(v);
          return isNaN(d.getTime()) ? null : d;
        };

        if (str(args.vendorId)) query.vendor = args.vendorId;
        if (str(args.customerId)) query.customer = args.customerId;

        if (str(args.contractNumber)) {
          query.contractNumber = {
            $regex: escapeRegex(str(args.contractNumber)),
            $options: 'i',
          };
        }

        if (str(args.paymentStatus)) {
          query.paymentStatus = str(args.paymentStatus);
        }

        if (str(args.insuranceTypeId)) {
          query.insuranceType = args.insuranceTypeId;
        }

        const parsedStart = validDate(args.startDate);
        const parsedEnd = validDate(args.endDate);
        if (parsedStart || parsedEnd) {
          query.startDate = {};
          if (parsedStart) query.startDate.$gte = parsedStart;
          if (parsedEnd) query.startDate.$lte = parsedEnd;
        }

        if (str(args.plateNumber)) {
          query['insuredObject.Улсын дугаар'] = {
            $regex: escapeRegex(str(args.plateNumber)),
            $options: 'i',
          };
        }

        if (str(args.customerRegistration)) {
          const customers = await models.Customer.find({
            registrationNumber: {
              $regex: escapeRegex(str(args.customerRegistration)),
              $options: 'i',
            },
          }).select('_id');
          if (customers.length > 0) {
            query.customer = { $in: customers.map((c: any) => c._id) };
          } else {
            return [];
          }
        }

        if (str(args.searchValue)) {
          const sv = escapeRegex(str(args.searchValue));
          const customers = await models.Customer.find({
            $or: [
              { firstName: { $regex: sv, $options: 'i' } },
              { lastName: { $regex: sv, $options: 'i' } },
              { registrationNumber: { $regex: sv, $options: 'i' } },
            ],
          }).select('_id');

          const customerIds = customers.map((c: any) => c._id);

          query.$or = [
            { contractNumber: { $regex: sv, $options: 'i' } },
            { 'insuredObject.Улсын дугаар': { $regex: sv, $options: 'i' } },
            ...(customerIds.length > 0
              ? [{ customer: { $in: customerIds } }]
              : []),
          ];
        }

        const contracts = await models.Contract.find(query).populate(
          'vendor customer insuranceType insuranceProduct coveredRisks.risk',
        );

        return contracts
          .filter(
            (c: any) => c.insuranceProduct != null && c.insuranceType != null,
          )
          .map((c: any) => ({
            ...c.toObject(),
            coveredRisks: c.coveredRisks.filter((cr: any) => cr.risk != null),
          }));
      } catch (e: any) {
        console.error('contracts query error:', e.message);
        return [];
      }
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  contract: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      const contract = await models.Contract.findById(id).populate(
        'vendor customer insuranceType insuranceProduct coveredRisks.risk',
      );

      if (!contract?.insuranceProduct || !contract?.insuranceType)
        return null;

      return {
        ...contract.toObject(),
        coveredRisks: contract.coveredRisks.filter(
          (cr: any) => cr.risk != null,
        ),
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  vendorContracts: Object.assign(
    async (
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
        .filter(
          (c: any) => c.insuranceProduct != null && c.insuranceType != null,
        )
        .map((c: any) => ({
          ...c.toObject(),
          coveredRisks: c.coveredRisks.filter((cr: any) => cr.risk != null),
        }));
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  vendorContract: Object.assign(
    async (
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

      if (!contract?.insuranceProduct || !contract?.insuranceType)
        return null;

      return {
        ...contract.toObject(),
        coveredRisks: contract.coveredRisks.filter(
          (cr: any) => cr.risk != null,
        ),
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),

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

      const vendorUser = await models.VendorUser.findOne({
        _id: insuranceVendorUser._id,
      });
      if (!vendorUser) throw new Error('Vendor user not found');

      const query: any = { vendor: vendorUser.vendor };

      if (categoryId) {
        query.insuranceType = categoryId;
      }

      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = startDate;
        if (endDate) query.startDate.$lte = endDate;
      }

      if (filters) {
        if (filters.contractNumber) {
          query.contractNumber = {
            $regex: filters.contractNumber,
            $options: 'i',
          };
        }

        if (filters.paymentStatus) {
          query.paymentStatus = filters.paymentStatus;
        }

        if (filters.paymentKind) {
          query.paymentKind = filters.paymentKind;
        }

        if (filters.insuranceProductId) {
          query.insuranceProduct = filters.insuranceProductId;
        }

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
            query.customer = null;
          }
        }

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

        if (filters.plateNumber) {
          query['insuredObject.Улсын дугаар'] = {
            $regex: filters.plateNumber,
            $options: 'i',
          };
        }

        if (filters.vehicleMark) {
          query['insuredObject.Тээврийн хэрэгслийн марк'] = {
            $regex: filters.vehicleMark,
            $options: 'i',
          };
        }

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
        list: list.filter(
          (c: any) => c.insuranceProduct != null && c.insuranceType != null,
        ),
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

      if (!contract?.insuranceType) return null;

      return contract;
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
