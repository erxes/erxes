import { IContext } from '~/connectionResolvers';
import { PdfGenerator } from '../../../services/pdfGenerator';
import { generateContractHTML } from '../../../services/contractPdfTemplate';
import Handlebars from 'handlebars';

export const contractPdfMutations = {
  generateContractPDF: async (
    _parent: undefined,
    { contractId }: { contractId: string },
    { models }: IContext,
  ) => {
    try {
      // Fetch contract with all populated fields
      const contract = await models.Contract.findById(contractId)
        .populate(
          'vendor customer insuranceType insuranceProduct coveredRisks.risk',
        )
        .lean();

      if (!contract) {
        throw new Error('Contract not found');
      }

      let htmlContent: string;

      // Check if product has a custom template
      const product = contract.insuranceProduct as any;
      if (product?.templateId) {
        // Fetch the custom template
        const template = await models.Template.findById(
          product.templateId,
        ).lean();
        if (template && template.htmlContent) {
          // Use custom template with Handlebars
          const compiledTemplate = Handlebars.compile(template.htmlContent);
          htmlContent = compiledTemplate({
            contractNumber: contract.contractNumber,
            vendor: contract.vendor,
            customer: contract.customer,
            insuranceType: contract.insuranceType,
            insuranceProduct: product,
            productName: product?.name,
            coveredRisks: contract.coveredRisks,
            chargedAmount: contract.chargedAmount,
            startDate: contract.startDate,
            endDate: contract.endDate,
            insuredObject: contract.insuredObject,
            vendorName: (contract.vendor as any)?.name,
            customerName: `${(contract.customer as any)?.firstName} ${
              (contract.customer as any)?.lastName
            }`,
            registrationNumber: (contract.customer as any)?.registrationNumber,
          });
        } else {
          // Fallback to default template
          htmlContent = generateContractHTML(contract);
        }
      } else {
        // Use default template
        htmlContent = generateContractHTML(contract);
      }

      // Generate PDF
      const pdfGenerator = new PdfGenerator();
      const pdfBuffer = await pdfGenerator.generatePDF(htmlContent);

      // Convert buffer to base64 for transmission
      const base64Pdf = pdfBuffer.toString('base64');

      return {
        success: true,
        base64: base64Pdf,
        filename: `contract_${contract.contractNumber}.pdf`,
      };
    } catch (error) {
      console.error('Error generating contract PDF:', error);
      throw new Error('Failed to generate PDF: ' + (error as Error).message);
    }
  },

  saveContractPDF: async (
    _parent: undefined,
    { contractId, pdfContent }: { contractId: string; pdfContent: string },
    { models }: IContext,
  ) => {
    const contract = await models.Contract.findByIdAndUpdate(
      contractId,
      { pdfContent },
      { new: true },
    ).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    if (!contract) {
      throw new Error('Contract not found');
    }

    return contract;
  },
};
