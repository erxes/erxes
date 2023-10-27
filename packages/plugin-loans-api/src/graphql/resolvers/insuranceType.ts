import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { IInsuranceTypeDocument } from '../../models/definitions/insuranceTypes';

const InsuranceTypes = {
  async company(
    insuranceType: IInsuranceTypeDocument,
    {},
    { subdomain }: IContext
  ) {
    if (!insuranceType.companyId) return null;

    return await sendMessageBroker(
      {
        subdomain,
        data: { _id: insuranceType.companyId },
        action: 'companies.findOne',
        isRPC: true
      },
      'contacts'
    );
  },
  yearPercents(insuranceType: IInsuranceTypeDocument) {
    return insuranceType.yearPercents;
  }
};

export default InsuranceTypes;
