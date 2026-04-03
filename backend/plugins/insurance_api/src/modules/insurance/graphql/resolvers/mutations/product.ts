import { IContext } from '~/connectionResolvers';

export const productMutations = {
  createInsuranceProduct: Object.assign(
    async (_parent: undefined, args: any, { models }: IContext) => {
      const {
        insuranceTypeId,
        coveredRisks,
        additionalCoverages,
        compensationCalculations,
        deductibleConfig,
        ...rest
      } = args;
      const product = await models.Product.create({
        ...rest,
        insuranceType: insuranceTypeId,
        coveredRisks: coveredRisks.map((cr: any) => ({
          risk: cr.riskId,
          coveragePercentage: cr.coveragePercentage,
        })),
        additionalCoverages: additionalCoverages || [],
        compensationCalculations: compensationCalculations || [],
        deductibleConfig: deductibleConfig || undefined,
      });
      const populated = await product.populate(
        'insuranceType coveredRisks.risk',
      );

      return {
        ...populated.toObject(),
        coveredRisks: populated.coveredRisks.filter(
          (cr: any) => cr.risk != null,
        ),
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateInsuranceProduct: Object.assign(
    async (
      _parent: undefined,
      {
        id,
        name,
        coveredRisks,
        pricingConfig,
        pdfContent,
        templateId,
        additionalCoverages,
        compensationCalculations,
        deductibleConfig,
      }: {
        id: string;
        name?: string;
        coveredRisks?: any[];
        pricingConfig?: any;
        pdfContent?: string;
        templateId?: string;
        additionalCoverages?: any[];
        compensationCalculations?: any[];
        deductibleConfig?: any;
      },
      { models }: IContext,
    ) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (pricingConfig !== undefined) updateData.pricingConfig = pricingConfig;
      if (pdfContent !== undefined) updateData.pdfContent = pdfContent;
      if (templateId !== undefined) updateData.templateId = templateId;
      if (coveredRisks !== undefined) {
        updateData.coveredRisks = coveredRisks.map((cr: any) => ({
          risk: cr.riskId,
          coveragePercentage: cr.coveragePercentage,
        }));
      }
      if (additionalCoverages !== undefined)
        updateData.additionalCoverages = additionalCoverages;
      if (compensationCalculations !== undefined)
        updateData.compensationCalculations = compensationCalculations;
      if (deductibleConfig !== undefined)
        updateData.deductibleConfig = deductibleConfig;

      const product = await models.Product.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!product) return null;

      const populated = await product.populate(
        'insuranceType coveredRisks.risk',
      );

      return {
        ...populated.toObject(),
        coveredRisks: populated.coveredRisks.filter(
          (cr: any) => cr.risk != null,
        ),
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  deleteInsuranceProduct: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      await models.Product.findByIdAndDelete(id);
      return true;
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
