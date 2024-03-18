// Settings

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const putResponseReturnBill = `
  mutation putResponseReturnBill($_id: String!) {
    putResponseReturnBill(_id: $_id) {
      _id
      createdAt
      modifiedAt
      contentType
      contentId
      number
      success
      billId
      date
      macAddress
      internalCode
      billType
      lotteryWarningMsg
      errorCode
      message
      getInformation
      taxType
      amount
      cityTax
      vat
      cashAmount
      nonCashAmount
      returnBillId
      sendInfo
      stocks
      registerNo
    }
  }
`;


export default {
  updateConfigs,
  putResponseReturnBill
};
