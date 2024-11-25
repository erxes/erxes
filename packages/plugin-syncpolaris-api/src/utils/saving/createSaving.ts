import {
  fetchPolaris,
  getBranch,
  getDepositAccount,
  updateContract,
  sendMessageBrokerData,
  genObjectOfRule
} from '../utils';

export const createSaving = async (subdomain: string, models, polarisConfig, syncLog, params) => {
  const savingContract = params.object;

  const savingProduct = await sendMessageBrokerData(
    subdomain,
    "savings",
    "contractType.findOne",
    { _id: savingContract.contractTypeId }
  );

  const customer = await sendMessageBrokerData(
    subdomain,
    "core",
    "customers.findOne",
    { _id: savingContract.customerId }
  );

  const branch = await getBranch(subdomain, savingContract.branchId);

  const deposit = await getDepositAccount(subdomain, savingContract.customerId);

  const dataOfRules = await genObjectOfRule(
    subdomain,
    "savings:contract",
    savingContract,
    (polarisConfig.saving && polarisConfig.saving[savingContract.contractTypeId || ''] || {}).values || {}
  )

  let sendData = {
    prodCode: savingProduct.code,
    slevel: 1,
    capMethod: "1",
    capAcntCode: deposit?.number || "",
    capAcntSysNo: "1306", // savingContract.storeInterestInterval,
    startDate: savingContract.startDate,
    maturityOption: savingContract.closeOrExtendConfig,
    rcvAcntCode:
      savingContract.depositAccount === "depositAccount"
        ? savingContract.depositAccount
        : "",
    brchCode: branch?.code,
    curCode: savingContract.currency,
    name: savingProduct.name,
    name2: savingProduct.name,
    termLen: savingContract.duration,
    maturityDate: savingContract.endDate,
    custCode: customer?.code,
    segCode: '81',
    jointOrSingle: 'S',
    statusCustom: '',
    statusDate: '',
    casaAcntCode: '',
    closedBy: '',
    closedDate: '',
    lastCtDate: '',
    lastDtDate: '',
    ...dataOfRules
  };

  const savingCode = await fetchPolaris({
    op: "13610120",
    data: [sendData],
    subdomain,
    models,
    polarisConfig,
    syncLog
  });

  if (savingCode) {
    await updateContract(
      subdomain,
      { _id: savingContract._id },
      { $set: { number: JSON.parse(savingCode) } },
      "savings"
    );
  }

  return savingCode;
};
