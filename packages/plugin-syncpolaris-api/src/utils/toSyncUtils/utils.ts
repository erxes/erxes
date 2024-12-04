import { sendCommonMessage } from "../../messageBroker";
import { getCustomerDetail } from "../customer/getCustomerDetail";
import { getLoanDetail } from "../loan/getLoanDetail";
import { getLoanSchedule } from "../loan/getLoanSchedule";
import { getSavingDetail } from "../saving/getSavingDetail";
import {
  getConfig,
  getContract,
  getCustomer,
  updateContract,
  updateCustomer
} from "../utils";

export const getCustomFields = async (subdomain, customFieldType, item?) => {
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: "core",
    action: "fields.find",
    data: {
      query: {
        contentType: customFieldType,
        code: { $exists: true, $ne: "" }
      },
      projection: {
        groupId: 1,
        code: 1,
        _id: 1
      }
    },
    isRPC: true,
    defaultValue: []
  });

  const customFieldsData = item?.customFieldsData || [];
  if (item) {
    for await (const f of fields) {
      const existingData = customFieldsData.find(c => c.field === f._id);
      item[f.code] = existingData?.value;
    }
  }

  return {
    fields: fields,
    item: item || []
  };
};

export const dateNames = ["startDate", "endDate"];
export const findDiffrentData = async (mainData, polarisData) => {
  if (polarisData) {
    const { _id, __v, ...data } = mainData;
    for (const [key, value] of Object.entries(data)) {
      const result = await isDiffrentFind(polarisData, key, value);
      if (result) return mainData;
    }
  }
};

export const isDiffrentFind = async (data, key, value) => {
  if (data.hasOwnProperty(key) === true && data[key] != value) {
    return await compareDate(data, key, value);
  }
  return false;
};

export const compareDate = async (data, key, value) => {
  if (dateNames.includes(key)) {
    const polarisDate = new Date(
      new Date(data[key]).getTime() -
      new Date(data[key]).getTimezoneOffset() * 60000,
    );
    const mainDate = new Date(String(value));
    if (polarisDate.getTime() === mainDate.getTime()) return false;
  } else return true;
};

export const preSyncDatas = async (mainData, polarisData, customFields) => {
  let updateData: any = {};

  if (polarisData) {
    const { _id, __v, customFieldsDate, ...data } = mainData;
    for await (const [key, value] of Object.entries(data)) {
      const isDiff = await isDiffrentFind(polarisData, key, value);
      if (isDiff) updateData[key] = polarisData[key];
    }
    const customFieldsData = mainData.customFieldsData || [];
    for await (const customField of customFields) {
      await setCustomField(customField, polarisData, customFieldsData);
    }
    updateData["customFieldsData"] = customFieldsData;
  }
  return updateData;
};
export const setCustomField = async (
  customField,
  customer,
  customFieldsData
) => {
  if (customer.hasOwnProperty(customField.code)) {
    await setCustomFieldValue(customField, customFieldsData, customer);
  }
  return customFieldsData;
};
export const setCustomFieldValue = async (
  customField,
  customFieldsData,
  customer
) => {
  const index = customFieldsData.findIndex(c => c.field === customField._id);
  if (index >= 0) {
    customFieldsData[index].value = customer[customField.code];
  } else {
    customFieldsData.push({
      field: customField._id,
      value: customer[customField.code]
    });
  }
  return customFieldsData;
};

export const getPolarisData = async (type, subdomain, config, item) => {
  try {
    switch (type) {
      case 'core:customer':
        return await getCustomerDetail(subdomain, config, { code: item.code });
      case 'loans:contract':
        return await getLoanDetail(subdomain, config, { number: item.number });
      case 'savings:contract':
        return await getSavingDetail(subdomain, config, { number: item.number });
      default:
        break;
    }
  } catch (error) {
    console.log("error:", error);
  }
};

export const syncDataToErxes = async (type, subdomain, item, updateData) => {
  switch (type) {
    case "core:customer":
      return await updateCustomer(subdomain, { code: item.code }, updateData);
    case "loans:contract":
      return setLoanWithSchedule(subdomain, item, updateData);
    case "savings:contract":
      return await updateContract(
        subdomain,
        { number: item.number },
        { $set: updateData },
        "savings"
      );
    default:
      break;
  }
};

export const getMainDatas = async (subdomain, type) => {
  // TODO check
  switch (type) {
    case 'core:customer': {
      return await getCustomer(subdomain, '');
    }
    case "loans:contract": {
      return await getContract(subdomain, {}, "loans");
    }
    case "savings:contract": {
      return await getContract(subdomain, {}, "savings");
    }
    default: {
      break;
    }
  }
};

export const setLoanWithSchedule = async (subdomain, item, updateData) => {
  await updateContract(
    subdomain,
    { number: item.number },
    { $set: updateData },
    'loans',
  )
  await preLoanSchedule(subdomain, item)
};

export const preLoanSchedule = async (subdomain, item) => {
  try {
    const polarisConfig = await getConfig(subdomain, 'POLARIS', {})
    const mainLoanSchedule = await getMainLoanSchedule(subdomain, { contractId: item._id })
    const loanSchedules = await getLoanSchedule(subdomain, polarisConfig, { number: item.number })

    if (!mainLoanSchedule && loanSchedules) {
      await createLoanSchedule(subdomain, loanSchedules, item._id)
    }
  } catch (error) {
    console.log('update schedule:', error)
  }
};

export const getMainLoanSchedule = async (subdomain, data) => {
  return await sendCommonMessage({
    subdomain,
    action: "firstLoanSchedules.findOne",
    serviceName: "loans",
    data: data,
    isRPC: true
  });
};

export const insertLoanSchedule = async (subdomain, data) => {
  return await sendCommonMessage({
    subdomain,
    action: "firstLoanSchedules.insertMany",
    serviceName: "loans",
    data: data,
    isRPC: true
  });
}
export const createLoanSchedule = async (subdomain, loanSchedules, contractId) => {
  try {
    const result: any[] = []

    for (const schedule of loanSchedules) {
      const loanSchedule = {
        "status": "pending",
        "payDate": new Date(schedule.schdDate),
        "scheduleDidStatus": "pending",
        "transactionIds": [],
        "isDefault": true,
        "scopeBrandIds": [],
        "createdAt": new Date(new Date().getTime()),
        "contractId": contractId,
        "version": "0",
        "balance": schedule.theorBal,
        "payment": schedule.totalAmount,
        "interestEve": schedule.intAmount,
        "interestNonce": schedule.amount,
        "total": schedule.totalAmount,
        "insurance": 0,
      }
      result.push(loanSchedule)
    }

    await insertLoanSchedule(subdomain, result)

  } catch (error) {
    console.log("insert loan schedule", error);
  }
};
