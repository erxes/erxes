import { IContext } from '~/connectionResolvers';
import { calculatePremium } from '@/insurance/utils/pricing';

const generateContractNumber = async (models: any): Promise<string> => {
  const prefix = 'INS';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const lastContract = await models.Contract.findOne({
    contractNumber: new RegExp(`^${prefix}${year}${month}`),
  }).sort({ contractNumber: -1 });

  let sequence = 1;
  if (lastContract?.contractNumber) {
    const lastSequence = Number.parseInt(lastContract.contractNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
};

export const contractMutations = {
  createInsuranceContract: Object.assign(
    async (_parent: undefined, args: any, { models }: IContext) => {
      const {
        vendorId,
        customerId,
        productId,
        insuredObject,
        startDate,
        endDate,
        paymentKind = 'cash',
        chargedAmount,
      } = args;

      const product = await models.Product.findById(productId)
        .populate('insuranceType')
        .populate('coveredRisks.risk');
      if (!product) throw new Error('Product not found');

      // Get vendor to check for pricing override
      const vendor = await models.Vendor.findById(vendorId);
      const vendorProduct = vendor?.offeredProducts?.find(
        (op: any) => op.product.toString() === productId.toString(),
      );

      // Use vendor pricing override if exists, otherwise use product pricing
      const pricingConfig =
        vendorProduct?.pricingOverride || product.pricingConfig;

      // Calculate premium based on pricing config and insured object
      const calculatedAmount = calculatePremium(pricingConfig, insuredObject);

      const coveredRisks = (product.coveredRisks || [])
        .filter((cr: any) => cr.risk != null)
        .map((cr: any) => ({
          risk: cr.risk._id || cr.risk,
          coveragePercentage: cr.coveragePercentage,
        }));

      const contractNumber = await generateContractNumber(models);

      // Generate PDF content from product template
      let pdfContent = product.pdfContent || null;
      if (pdfContent) {
        // Get customer data
        const customer = await models.Customer.findById(customerId);

        // replace template variables with actual data
        pdfContent = pdfContent
          .replaceAll('{{contractNumber}}', contractNumber)
          .replaceAll(
            '{{customerName}}',
            customer ? `${customer.lastName} ${customer.firstName}` : '',
          )
          .replaceAll(
            '{{registrationNumber}}',
            customer?.registrationNumber || '',
          )
          .replaceAll('{{email}}', customer?.email || '')
          .replaceAll('{{phone}}', customer?.phone || '')
          .replaceAll(
            '{{chargedAmount}}',
            (chargedAmount || calculatedAmount).toLocaleString(),
          )
          .replaceAll(
            '{{startDate}}',
            new Date(startDate).toLocaleDateString('mn-MN'),
          )
          .replaceAll(
            '{{endDate}}',
            new Date(endDate).toLocaleDateString('mn-MN'),
          )
          .replaceAll('{{productName}}', product.name || '')
          .replaceAll('{{plateNumber}}', insuredObject?.['Улсын дугаар'] || '')
          .replaceAll('{{chassisNumber}}', insuredObject?.['Арлын дугаар'] || '')
          .replaceAll(
            '{{vehicleMake}}',
            insuredObject?.['Тээврийн хэрэгслийн марк'] || '',
          )
          .replaceAll('{{manufacturer}}', insuredObject?.['Үйлдвэрлэгч'] || '')
          .replaceAll('{{color}}', insuredObject?.['Өнгө'] || '')
          .replaceAll(
            '{{manufactureYear}}',
            insuredObject?.['Үйлдвэрлэсэн он'] || '',
          )
          .replaceAll('{{importYear}}', insuredObject?.['Орж ирсэн он'] || '')
          .replaceAll(
            '{{assessedValue}}',
            insuredObject?.['Даатгалын үнэлгээ (₮)'] || '',
          );
      }

      const contract = await models.Contract.create({
        contractNumber,
        vendor: vendorId,
        customer: customerId,
        insuranceType: (product.insuranceType as any)._id,
        insuranceProduct: productId,
        coveredRisks,
        chargedAmount: chargedAmount || calculatedAmount,
        startDate,
        endDate,
        insuredObject,
        paymentKind,
        paymentStatus: 'pending',
        pdfContent,
      });

      return contract.populate(
        'vendor customer insuranceType insuranceProduct coveredRisks.risk',
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateContractPaymentStatus: Object.assign(
    async (
      _parent: undefined,
      args: { contractId: string; paymentStatus: string },
      { models }: IContext,
    ) => {
      const { contractId, paymentStatus } = args;

      const contract = await models.Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Validate payment status
      const validStatuses = ['pending', 'paid', 'cancelled'] as const;
      if (!validStatuses.includes(paymentStatus as any)) {
        throw new Error(
          `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`,
        );
      }

      contract.paymentStatus = paymentStatus as
        | 'pending'
        | 'paid'
        | 'cancelled';
      await contract.save();

      return contract.populate(
        'vendor customer insuranceType insuranceProduct coveredRisks.risk',
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateContract: Object.assign(
    async (
      _parent: undefined,
      args: {
        contractId: string;
        customerId: string;
        insuredObject?: any;
        paymentStatus?: string;
      },
      { models }: IContext,
    ) => {
      const { contractId, customerId, insuredObject, paymentStatus } = args;

      const contract = await models.Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Update customer reference
      if (customerId) {
        const customer = await models.Customer.findById(customerId);
        if (!customer) {
          throw new Error('Customer not found');
        }
        contract.customer = customerId;
      }

      // Update insured object (vehicle info)
      if (insuredObject) {
        contract.insuredObject = {
          ...contract.insuredObject,
          ...insuredObject,
        };
      }

      // Update payment status if provided
      if (paymentStatus) {
        const validStatuses = ['pending', 'paid', 'cancelled'] as const;
        if (!validStatuses.includes(paymentStatus as any)) {
          throw new Error(
            `Invalid payment status. Must be one of: ${validStatuses.join(
              ', ',
            )}`,
          );
        }
        contract.paymentStatus = paymentStatus as
          | 'pending'
          | 'paid'
          | 'cancelled';
      }

      await contract.save();

      return contract.populate(
        'vendor customer insuranceType insuranceProduct coveredRisks.risk',
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
