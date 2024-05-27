import { sendCommonMessage } from '../messageBroker';
import { isRegisterNumberValid } from '../utils';

export const afterCustomerCreate = async (subdomain, params) => {
  const { newData, object } = params;

  if (!newData.code) {
    return;
  }

  if (!isRegisterNumberValid(newData.code)) {
    return;
  }

  const services = [
    {
      value: 'WS100101_getCitizenIDCardInfo',
      label: 'Иргэний үнэмлэхний мэдээлэл дамжуулах сервис'
    },
    {
      value: 'WS100407_getDriverLicenseInfo',
      label: 'Жолоочийн эрхийн мэдээлэл авах'
    },
    {
      value: 'WS100417_specialDriverInfo',
      label: 'Мэргэшсэн жолоочийн мэдээлэл дамжуулах сервис'
    }
  ];
  // wait for 10 sec for each service call
  for (const service of services) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const response = await sendCommonMessage({
      subdomain,
      serviceName: 'xyp',
      action: 'fetch',
      data: {
        wsOperationName: service.value,
        params: {
          regnum: newData.code
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!response) {
      continue;
    }

    const xypData = {
      serviceName: service.value,
      serviceDescription: service.label,
      data: response.return.response
    };

    const doc = {
      contentType: 'contacts:customer',
      contentTypeId: object._id,
      data: [xypData]
    };

    await sendCommonMessage({
      subdomain,
      serviceName: 'xyp',
      action: 'insertOrUpdate',
      data: doc,
      isRPC: true,
      defaultValue: null
    });
  }

  return;
};

export const afterCustomerUpdate = async (subdomain, params) => {
  const { newData, object } = params;

  if (!newData.code) {
    return;
  }

  if (!isRegisterNumberValid(newData.code)) {
    return;
  }

  if (object.code === newData.code) {
    return;
  }

  const services = [
    {
      value: 'WS100101_getCitizenIDCardInfo',
      label: 'Иргэний үнэмлэхний мэдээлэл дамжуулах сервис'
    },
    {
      value: 'WS100407_getDriverLicenseInfo',
      label: 'Жолоочийн эрхийн мэдээлэл авах'
    },
    {
      value: 'WS100417_specialDriverInfo',
      label: 'Мэргэшсэн жолоочийн мэдээлэл дамжуулах сервис'
    }
  ];

  for (const service of services) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const response = await sendCommonMessage({
      subdomain,
      serviceName: 'xyp',
      action: 'fetch',
      data: {
        wsOperationName: service.value,
        params: {
          regnum: newData.code
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!response) {
      continue;
    }

    const xypData = {
      serviceName: service.value,
      serviceDescription: service.label,
      data: response.return.response
    };

    const doc = {
      contentType: 'contacts:customer',
      contentTypeId: object._id,
      data: [xypData]
    };

    await sendCommonMessage({
      subdomain,
      serviceName: 'xyp',
      action: 'insertOrUpdate',
      data: doc,
      isRPC: true,
      defaultValue: null
    });
  }

  return;
};
