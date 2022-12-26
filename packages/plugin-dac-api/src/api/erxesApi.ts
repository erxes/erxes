import {
  sendCarsMessage,
  sendCommonMessage,
  sendContactsMessage
} from '../messageBroker';

export const getCustomer = async (req, res, subdomain) => {
  const phoneNumber = req.query.cellular;
  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      primaryPhone: phoneNumber
    },
    isRPC: true,
    defaultValue: null
  });

  if (!customer) {
    res.json({
      status: 'error',
      message: 'Customer not found'
    });
  }
  const customerId = customer._id;

  const carInfo = await sendCarsMessage({
    subdomain,
    action: 'vehicle.findOne',
    data: {
      customerIds: customerId
    },
    isRPC: true
  });

  const customFields: any = {};
  const vehicle: any = [];

  customFields.firstName = customer.firstName;
  customFields.lastName = customer.lastName;
  customFields.cellular = customer.primaryPhone;
  customFields.e_mail = customer.primaryEmail;
  customFields.vehicle = vehicle;

  const fieldIds = (customer.customFieldsData || []).map(d => d.field);
  console.log('++++++++++++++++');

  const fields = await sendCommonMessage({
    subdomain: 'os',
    data: {
      query: {
        _id: { $in: fieldIds }
      }
    },
    serviceName: 'forms',
    action: 'fields.find',
    isRPC: true,
    defaultValue: []
  });

  for (const customFieldData of customer.customFieldsData || []) {
    const field = fields.find(f => f._id === customFieldData.field);

    if (field) {
      customFields[field.code] = customFieldData.value;
    }
  }

  vehicle.push({
    vehCode: carInfo.plateNumber,
    cardCode: customer.cardCode,
    cardName: customer.firstName,
    markDesc: '',
    vehDesc: carInfo.description,
    vehYear: carInfo.importYear,
    maxKm: '',
    maxTm: '',
    kmUnit: '',
    vehId: '',
    createDate: '',
    updateDate: ''
  });

  return res.json(customFields);
};

export const getCustomerByCardCode = async (req, res, subdomain) => {
  // const customerId = req.query.idNumber;

  // const customers = await sendContactsMessage({
  //   subdomain,
  //   action: 'customers.findOne',
  //   data: {
  //     query: {
  //       cardCode: { $in: customerId }
  //     }
  //   },
  //   isRPC: true,
  //   defaultValue: null
  // });
  // console.log('customer:::::::::::', customers);

  // const customFields: any = {};

  return res.json('ok');
};

export const createCustomer = async (req, res, subdomain) => {
  const {
    firstName,
    lastName,
    licTradNum,
    currency,
    cellular,
    e_mail,
    validFor,
    frozenFor,
    point,
    pinCode
  } = req.body;

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.createCustomer',
    data: {
      firstName: firstName,
      lastName: lastName,
      primaryPhone: cellular,
      primaryEmail: e_mail
    },
    isRPC: true,
    defaultValue: null
  });

  const customFields: any = {};

  customFields.firstName = customer.firstName;
  customFields.lastName = customer.lastName;
  customFields.cellular = customer.primaryPhone;
  customFields.e_mail = customer.primaryEmail;

  return res.send(customFields);
};

export const updateCustomer = async (req, res, subdomain) => {
  const {
    firstName,
    lastName,
    licTradNum,
    currency,
    cellular,
    e_mail,
    validFor,
    frozenFor,
    point,
    pinCode
  } = req.body;

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      primaryPhone: cellular
    },
    isRPC: true,
    defaultValue: null
  });
  if (!customer) {
    return res.send('Customer not found');
  }
  const customerId = customer._id;

  await sendContactsMessage({
    subdomain,
    action: 'customers.updateCustomer',
    data: {
      _id: customerId,
      doc: {
        firstName: firstName,
        lastName: lastName,
        primaryPhone: cellular,
        primaryEmail: e_mail
      }
    },
    isRPC: true,
    defaultValue: null
  });

  const updatedCustomer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      _id: customerId
    },
    isRPC: true,
    defaultValue: null
  });

  const customFields: any = {};

  customFields.firstName = updatedCustomer.firstName;
  customFields.lastName = updatedCustomer.lastName;
  customFields.cellular = updatedCustomer.primaryPhone;
  customFields.e_mail = updatedCustomer.primaryEmail;

  return res.send(customFields);
};
