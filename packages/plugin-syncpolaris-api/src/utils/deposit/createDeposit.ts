import {
  customFieldToObject,
  fetchPolaris,
  genObjectOfRule,
  getBranch,
  sendMessageBrokerData,
  updateContract
} from "../utils";
import { IPolarisDeposit } from "./types";
import { validateDepositObject } from "./validator";

export const createDeposit = async (subdomain: string, models, polarisConfig, syncLog, params) => {
  const deposit = params.updatedDocument || params.object;

  const objectDeposit = await customFieldToObject(
    subdomain,
    "savings:contract",
    deposit
  );

  const savingProduct = await sendMessageBrokerData(
    subdomain,
    "savings",
    "contractType.findOne",
    { _id: deposit.contractTypeId }
  );

  const branch = await getBranch(subdomain, deposit.branchId);

  const customer = await sendMessageBrokerData(
    subdomain,
    "core",
    "customers.findOne",
    { _id: deposit.customerId }
  );

  const dataOfRules = await genObjectOfRule(
    subdomain,
    "savings:contract",
    objectDeposit,
    (polarisConfig.deposit && polarisConfig.deposit[deposit.contractTypeId || ''] || {}).values || {}
  )

  let sendData: IPolarisDeposit = {
    acntType: "CA",
    prodCode: savingProduct.code,
    brchCode: branch.code,
    curCode: objectDeposit.currency,
    custCode: customer.code,
    name: deposit.number,
    name2: deposit.number,
    slevel: objectDeposit.slevel || '1',
    jointOrSingle: 'S',
    dormancyDate: '',
    statusDate: '',
    flagNoCredit: '0',
    flagNoDebit: '0',
    salaryAcnt: 'N',
    corporateAcnt: 'N',
    capAcntCode: '',
    capMethod: '0',
    segCode: '81',
    paymtDefault: '',
    odType: 'NON',
    ...dataOfRules
  };

  await validateDepositObject(sendData);

  const depositCode = await fetchPolaris({
    subdomain,
    op: "13610020",
    data: [sendData],
    models,
    polarisConfig,
    syncLog
  });

  if (typeof depositCode === "string") {
    await updateContract(
      subdomain,
      { _id: deposit._id },
      { $set: { number: JSON.parse(depositCode) } },
      "savings"
    );
  }

  return depositCode;
};
