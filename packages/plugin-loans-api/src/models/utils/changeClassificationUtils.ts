import { IModels } from '../../connectionResolver';
import { CONTRACT_CLASSIFICATION } from '../definitions/constants';
import { IContractTypeDocument } from '../definitions/contractTypes';
import { IContractDocument } from '../definitions/contracts';
import { getDiffDay } from './utils';

export async function changeClassificationContract(
  contract: IContractDocument,
  currentDate: Date,
  newClassification: string,
  models: IModels
) {
  const lastSchedule = await models.Schedules.getLastSchedule(
    contract._id,
    currentDate
  );

  if (!lastSchedule) return;

  const classificationChange = {
    description: 'auto',
    invDate: currentDate,
    total: lastSchedule.balance,
    classification: contract.classification,
    newClassification: newClassification,
    createdAt: new Date()
  };

  models.Classification.create(classificationChange);
}

export async function massChangeClassification(
  contracts: IContractDocument[],
  currentDate: Date,
  models: IModels
) {
  const contractTypes: IContractTypeDocument[] = await models.ContractTypes.find(
    { _id: contracts.map(a => a.contractTypeId) }
  ).lean();

  for await (const contract of contracts) {
    const currentContractType = contractTypes.find(
      a => a._id === contract.contractTypeId
    );

    let newClassification = contract.classification;

    const lastMainSchedule = await models.Schedules.getLastSchedule(
      contract._id,
      currentDate
    );

    const diffDay = getDiffDay(lastMainSchedule.payDate, currentDate);

    if ((currentContractType?.config.normalExpirationDay ?? 0) >= diffDay)
      newClassification = CONTRACT_CLASSIFICATION.NORMAL;
    else if ((currentContractType?.config.expiredExpirationDay ?? 30) < diffDay)
      newClassification = CONTRACT_CLASSIFICATION.EXPIRED;
    else if ((currentContractType?.config.doubtExpirationDay ?? 90) < diffDay)
      newClassification = CONTRACT_CLASSIFICATION.DOUBTFUL;
    else if (
      (currentContractType?.config.negativeExpirationDay ?? 180) < diffDay
    )
      newClassification = CONTRACT_CLASSIFICATION.NEGATIVE;
    else if ((currentContractType?.config.badExpirationDay ?? 360) < diffDay)
      newClassification = CONTRACT_CLASSIFICATION.BAD;

    if (contract.classification !== newClassification)
      changeClassificationContract(
        contract,
        currentDate,
        newClassification,
        models
      );
  }
}
