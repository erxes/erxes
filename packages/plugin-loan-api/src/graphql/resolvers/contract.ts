import { SCHEDULE_STATUS } from '../../models/definitions/constants';
import { getDiffDay, getNextMonthDay } from '../../models/utils/utils';

const Contracts = {
  contractType(contract) {
    return (
      contract.contractTypeId && {
        __typename: 'User',
        _id: contract.contractTypeId
      }
    );
  },
  relationExpert(contract) {
    return (
      contract.relationExpertId && {
        __typename: 'User',
        _id: contract.relationExpertId
      }
    );
  },
  leasingExpert(contract) {
    return (
      contract.leasingExpertId && {
        __typename: 'User',
        _id: contract.leasingExpertId
      }
    );
  },
  riskExpert(contract) {
    return (
      contract.riskExpertId && {
        __typename: 'User',
        _id: contract.riskExpertId
      }
    );
  },
  customers(contract) {
    async ({ models }) => {
      const customerIds = await models.Conformities.savedConformity({
        mainType: 'contract',
        mainTypeId: contract._id.toString(),
        relTypes: ['customer']
      });

      return models.Customers.find({ _id: { $in: customerIds || [] } });
    };
  },
  companies(contract) {
    async ({ models }) => {
      const companyIds = await models.Conformities.savedConformity({
        mainType: 'contract',
        mainTypeId: contract._id.toString(),
        relTypes: ['company']
      });

      return models.Companies.find({ _id: { $in: companyIds || [] } });
    };
  },
  insurances(contract) {
    async ({ models }) => {
      const insurances: any = [];

      for (const data of contract.insurancesData || []) {
        if (!data.insuranceTypeId) {
          continue;
        }

        const insurance = await models.InsuranceTypes.getInsuranceType(models, {
          _id: data.insuranceTypeId
        });
        const company = await models.Companies.findOne(
          { _id: insurance.companyId },
          { _id: 1, primaryName: 1, code: 1 }
        );

        insurances.push({
          ...(typeof data.toJSON === 'function' ? data.toJSON() : data),
          insurance,
          company
        });
      }

      return insurances;
    };
  },
  collaterals(contract) {
    async ({ models }) => {
      const collaterals: any = [];

      for (const data of contract.collateralsData || []) {
        const collateral = await models.Products.findOne({
          _id: data.collateralId
        });
        const insuranceType = await models.InsuranceTypes.findOne({
          _id: data.insuranceTypeId
        });

        collaterals.push({
          ...(typeof data.toJSON === 'function' ? data.toJSON() : data),
          collateral,
          insuranceType
        });
      }

      return collaterals;
    };
  },
  currentSchedule(contract) {
    async ({ models }) => {
      const currentSchedule = await models.RepaymentSchedules.findOne({
        contractId: contract._id,
        status: { $in: [SCHEDULE_STATUS.LESS, SCHEDULE_STATUS.PENDING] }
      }).sort({ payDate: 1 });

      if (!currentSchedule) {
        const lastDone = await models.RepaymentSchedules.findOne({
          contractId: contract._id
        }).sort({ payDate: -1 });

        if (!lastDone) {
          contract.untilDay = getDiffDay(
            new Date(),
            getNextMonthDay(contract.startDate, contract.scheduleDay)
          );
          contract.donePercent = 0;
          return contract;
        }

        lastDone.untilDay = 0;
        lastDone.donePercent = 100;

        return lastDone;
      }

      currentSchedule.untilDay = getDiffDay(
        new Date(),
        currentSchedule.payDate
      );
      currentSchedule.donePercent =
        ((contract.leaseAmount -
          (currentSchedule.balance + currentSchedule.payment)) /
          contract.leaseAmount) *
        100;
      currentSchedule.balance =
        currentSchedule.balance + currentSchedule.payment;
      currentSchedule.remainderTenor = await models.RepaymentSchedules.find({
        contractId: contract._id,
        status: SCHEDULE_STATUS.PENDING
      }).countDocuments();

      return currentSchedule;
    };
  },
  relContract(contract) {
    async ({ models }) => {
      if (!contract.relContractId) {
        return;
      }

      return models.LoanContracts.findOne({ _id: contract.relContractId });
    };
  }
};

export default Contracts;
